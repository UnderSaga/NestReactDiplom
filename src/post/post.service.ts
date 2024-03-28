import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Comment } from "src/schemas/comment.schema"
import { Model } from "mongoose"
import { PostDto } from "./post.dto"
import { Post } from "src/schemas/post.schema"
import { Response } from "express"

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>
  ) {}

  async create(postDto: PostDto, res: Response) {
    try {
      const doc = new this.postModel({
        header: postDto.header,
        body: postDto.body,
        tags: postDto.tags,
        imageUrl: postDto.imageUrl,
      })

      await doc.save()

      res.json(doc)
    } catch (err) {
      console.error(err)
      res.status(500).json({
        message:
          "Не удалось создать статью. Возможно, статья с таким заголовком уже существует.",
      })
    }
  }

  async getAll(res: Response) {
    try {
      const posts = await this.postModel.find()

      res.json(posts)
    } catch (error) {
      res.status(500).json({
        error: "Не удалось получить список статей.",
      })
    }
  }

  async getOne(id: string, res: Response) {
    try {
      await this.postModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          {
            $inc: { viewCount: 1 },
          },
          {
            returnDocument: "after",
          }
        )
        .then((doc) => {
          if (!doc) {
            return res.status(404).json({
              message: "Статья не найдена.",
            })
          }

          res.json(doc)
        })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось получить список статей.",
      })
    }
  }

  async updatePost(dto: PostDto, id: string, res: Response) {
    try {
      await this.postModel
        .findByIdAndUpdate(
          {
            _id: id,
          },
          {
            header: dto.header,
            body: dto.body,
            tags: dto.tags,
            imageUrl: dto.imageUrl,
          }
        )
        .then((doc) => {
          if (!doc) {
            return res.status(404).json({
              message: "Статья не найдена",
            })
          }

          res.json({ message: "Статья успешно обновлена" })
        })
    } catch (error) {
      res.status(500).json({
        message:
          "Не удалось обновить статью. Возможно, статья с таким заголовком уже есть.",
      })
    }
  }

  async deletePost(id: string, res: Response) {
    try {
      await this.postModel.findByIdAndDelete(id).then((doc) => {
        if (!doc) {
          throw new Error()
        }

        res.json({
          message: "Статья успешно удалена",
        })
      })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось получить список статей.",
      })
    }
  }

  async getComments(id: string, res: Response) {
    try {
      const post = await this.postModel.findById(id)

      if (!post) {
        return res.status(404).json({
          message: "Статья не найдена.",
        })
      }

      const list = await Promise.all(
        post.comments.map((comment) => {
          return this.commentModel.findById(comment)
        })
      )

      res.json(list)
    } catch (error) {
      res.status(500).json({
        error: "Не удалось получить список комментариев.",
      })
    }
  }
}
