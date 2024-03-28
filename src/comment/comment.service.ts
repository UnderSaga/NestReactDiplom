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
        res.status(400).json({
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

  async update(id: string, dto: CommentDto, res: Response) {
    try {
      const { comment, ...CommentDto } = dto

      await this.commentModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          {
            comment: comment,
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
        error,
      })
    }
  }

  async delete(id: string, res: Response) {
    try {
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
        error,
      })
    }
  }
}
