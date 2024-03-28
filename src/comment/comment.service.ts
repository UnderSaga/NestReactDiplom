import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CommentDto } from "./comment.dto"
import { Comment } from "src/schemas/comment.schema"
import { Response } from "express"
import { JwtService } from "@nestjs/jwt"
import { Post } from "src/schemas/post.schema"

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private jwtService: JwtService
  ) {}

  async create(token: string, dto: CommentDto, res: Response) {
    try {
      const { postId, comment } = dto
      if (!comment) {
        return res.status(400).json({
          message: "Комментарий не может быть пустым.",
        })
      }

      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      const newComment = new this.commentModel({
        comment,
        author: decoded._id,
        changed: false,
      })
      await newComment.save()

      try {
        await this.postModel.findByIdAndUpdate(postId, {
          $push: { comments: newComment._id },
        })
      } catch (error) {
        console.log(error)
      }

      res.json(newComment)
    } catch (error) {
      res.json({
        error,
      })
    }
  }

  async update(id: string, dto: CommentDto, res: Response, token: string) {
    try {
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      const findComment = await this.commentModel.findById(id)

      if (decoded.role[0] != "ADMIN" && decoded._id != findComment.author) {
        return res.status(403).json({
          message: "Недостаточно прав для изменения комментария.",
        })
      }
      const { comment } = dto

      if (findComment.comment === comment) {
        return res.json(findComment)
      }

      await this.commentModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          {
            comment: comment,
            changed: true,
          }
        )
        .then((com) => {
          if (!com) {
            return res.status(404).json({
              message: "Комментарий не найден.",
            })
          }

          res.json({ success: true })
        })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось обновить комментарий.",
      })
    }
  }

  async delete(token: string, id: string, res: Response) {
    try {
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      const findComment = await this.commentModel.findById(id)
      if (decoded.role[0] != "ADMIN" && decoded._id != findComment.author) {
        return res.status(403).json({
          message: "Недостаточно прав для изменения комментария.",
        })
      }
      await this.commentModel
        .findByIdAndDelete({
          _id: id,
        })
        .then((com) => {
          if (!com) {
            return res.status(404).json({
              message: "Комментарий не найден.",
            })
          }

          res.json({ success: true })
        })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось удалить комментарий.",
      })
    }
  }
}
