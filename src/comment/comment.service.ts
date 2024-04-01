import { HttpException, HttpStatus, Injectable } from "@nestjs/common"
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
      if (!token) {
        res.status(403).json({
          message: "Вы не авторизованы.",
        })
      }

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
        postId,
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
      if (!token) {
        res.status(403).json({
          message: "Вы не авторизованы.",
        })
      }

      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      const findComment = await this.commentModel.findById(id)

      if (!findComment) {
        return res.status(404).json({
          message: "Комментарий не найден.",
        })
      }

      if (decoded.role[0] != "ADMIN" && decoded._id != findComment.author) {
        return res.status(403).json({
          message: "Недостаточно прав.",
        })
      }

      const { comment } = dto

      if (findComment.comment === comment) {
        return res.json(findComment)
      }

      await this.commentModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          comment: comment,
          changed: true,
        }
      )

      res.json({ success: true })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось обновить комментарий.",
      })
    }
  }

  async delete(token: string, id: string, res: Response) {
    try {
      if (!token) {
        res.status(403).json({
          message: "Вы не авторизованы.",
        })
      }

      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      const findComment = await this.commentModel.findById(id)

      if (!findComment) {
        return res.status(404).json({
          message: "Комментарий не найден.",
        })
      }

      if (decoded.role[0] != "ADMIN" && decoded._id != findComment.author) {
        return res.status(403).json({
          message: "Недостаточно прав для изменения комментария.",
        })
      }

      const comment = await this.commentModel.findById({
        _id: id,
      })

      try {
        await this.postModel.findByIdAndUpdate(
          {
            _id: comment.postId,
          },
          {
            $pull: { comments: comment._id },
          }
        )
      } catch (error) {
        throw new Error()
      }

      await this.commentModel.findByIdAndDelete({
        _id: id,
      })

      res.json({ success: true })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось удалить комментарий.",
      })
    }
  }
}
