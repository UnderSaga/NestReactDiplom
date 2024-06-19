import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CommentDto } from "./comment.dto"
import { Response } from "express"
import { JwtService } from "@nestjs/jwt"
import { Post, Comment } from "src/schemas/index.schema"
import { Logger } from "winston"

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private jwtService: JwtService,
    @Inject("winston")
    private readonly logger: Logger
  ) {}

  async create(token: string, dto: CommentDto, res: Response) {
    this.logger.info("Начинаем создание комментариев.")
    try {
      this.logger.info("Получем тело комментария и id статьи.")
      const { postId, comment } = dto
      if (!comment) {
        this.logger.error("Не получено тело комментария.")
        return res.status(400).json({
          error: "Комментарий не может быть пустым.",
        })
      }

      this.logger.info("Расшифровываем токен.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      console.log(decoded)

      this.logger.info("Создаем модельку комментария.")
      const newComment = new this.commentModel({
        postId,
        comment,
        author: decoded._id,
        authorName: decoded.name,
        changed: false,
      })

      this.logger.info("Сохраняем комментарий в базу данных.")
      await newComment.save()

      try {
        this.logger.info("Привязываем комментарий к статье.")
        await this.postModel.findByIdAndUpdate(postId, {
          $push: { comments: newComment._id },
        })
      } catch (error) {
        this.logger.error("Не удалось привязать комментарий к статье.")
        return res.status(500).json({
          error: "Не удалось привязать комментарий к статье.",
        })
      }

      this.logger.info("Возвращаем созданный комментарий.")
      res.json(newComment)
    } catch (error) {
      this.logger.error("Не удалось создать комментарий.")
      res.json({
        error,
      })
    }
  }

  async update(id: string, dto: CommentDto, res: Response) {
    this.logger.info("Начинаем обновление комментария.")
    try {
      if (!id) {
        this.logger.error("Не получен id комметария.")
        res.status(400).json({
          error: "Не получен id комметария.",
        })
      }

      this.logger.info("Ищем комментарий.")
      const findComment = await this.commentModel.findById(id)

      if (!findComment) {
        this.logger.error("Комментарий не найден.")
        return res.status(404).json({
          error: "Комментарий не найден.",
        })
      }

      this.logger.info("Получем тело комментария.")
      const { comment } = dto

      if (findComment.comment === comment) {
        this.logger.info(
          "Передано то же тело, что было у комментария до этого. Возвращаем предыдущий комментарий."
        )
        return res.json(findComment)
      }

      this.logger.info("Ищем комментарий и обновляем его.")
      await this.commentModel.findByIdAndUpdate(
        {
          _id: id,
        },
        {
          comment: comment,
          changed: true,
        }
      )

      this.logger.info("Комментарий успешно обновлен.")
      res.json({ success: true })
    } catch (error) {
      this.logger.error("Не удалось обновить комментарий.")
      res.status(500).json({
        error: "Не удалось обновить комментарий.",
      })
    }
  }

  async delete(id: string, res: Response) {
    this.logger.info("Начинаем удаление комментария.")
    try {
      if (!id) {
        this.logger.error("Не получен id комметария.")
        res.status(400).json({
          error: "Не получен id комметария.",
        })
      }

      this.logger.info("Ищем комментарий.")
      const findComment = await this.commentModel.findById(id)

      if (!findComment) {
        this.logger.error("Комментарий не найден.")
        return res.status(404).json({
          error: "Комментарий не найден.",
        })
      }

      this.logger.info("Убираем комментарий из статьи.")
      try {
        await this.postModel.findByIdAndUpdate(
          {
            _id: findComment.postId,
          },
          {
            $pull: { comments: findComment._id },
          }
        )
      } catch (error) {
        this.logger.error("Не удалось убрать комментарий из статьи.")
        throw new Error()
      }

      this.logger.info("Удаляем комментарий.")
      await this.commentModel.findByIdAndDelete({
        _id: id,
      })

      this.logger.info("Комментарий успешно удален.")
      res.json({ success: true })
    } catch (error) {
      this.logger.info("Не удалось удалить комментарий.")
      res.status(500).json({
        error: "Не удалось удалить комментарий.",
      })
    }
  }

  async likeComment(token: string, id: string, res: Response) {
    this.logger.info("Лайкаем комментарий.")
    try {
      if (!id) {
        this.logger.error("Не получен id комметария.")
        res.status(400).json({
          error: "Не получен id комметария.",
        })
      }

      this.logger.info("Расшифровываем токен.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      this.logger.info("Ищем комментарий.")
      const findComment = await this.commentModel.findById(id)

      if (!findComment) {
        this.logger.error("Комментарий не найден.")
        return res.status(404).json({
          error: "Комментарий не найден.",
        })
      }

      let state: boolean

      try {
        if (findComment.likes.includes(decoded._id)) {
          this.logger.info("Удаляем лайк.")
          await findComment.updateOne(
            {
              $pull: { likes: decoded._id },
            },
            {
              returnDocument: "after",
            }
          )
          state = false
        } else {
          this.logger.info("Ставим лайк.")
          await findComment.updateOne(
            {
              $push: { likes: decoded._id },
            },
            {
              returnDocument: "after",
            }
          )
          state = true
        }
      } catch (error) {
        throw new Error()
      }

      const { likes } = await this.commentModel.findById(id)

      this.logger.info("Комментарий успешно лайкнут/разлайкнут.")
      res.json({ state, likes })
    } catch (error) {
      this.logger.info("Не удалось лайкнуть комментарий.")
      res.status(500).json({
        error: "Не удалось лайкнуть комментарий.",
      })
    }
  }
}
