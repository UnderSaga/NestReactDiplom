import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CommentDto } from "./comment.dto"
import { Comment } from "src/schemas/comment.schema"
import { Response } from "express"
import { JwtService } from "@nestjs/jwt"
import { Post } from "src/schemas/post.schema"
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
      if (!token) {
        this.logger.error("Не получен токен пользователя.")
        res.status(403).json({
          message: "Вы не авторизованы.",
        })
      }

      this.logger.info("Получем тело комментария и id статьи.")
      const { postId, comment } = dto
      if (!comment) {
        this.logger.error("Не получено тело комментария.")
        return res.status(400).json({
          message: "Комментарий не может быть пустым.",
        })
      }

      this.logger.info("Расшифровываем токен.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      this.logger.info("Создаем модельку комментария.")
      const newComment = new this.commentModel({
        postId,
        comment,
        author: decoded._id,
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

  async update(id: string, dto: CommentDto, res: Response, token: string) {
    this.logger.info("Начинаем обновление комментария.")
    try {
      if (!id) {
        this.logger.error("Не получен id комметария.")
        res.status(400).json({
          error: "Не получен id комметария.",
        })
      }

      if (!token) {
        this.logger.error("Не получен токен пользователя.")
        res.status(403).json({
          error: "Вы не авторизованы.",
        })
      }

      this.logger.info("Расшифровываем токен пользователя.")
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

      if (decoded.role[0] != "ADMIN" && decoded._id != findComment.author) {
        this.logger.error("Недостаточно прав.")
        return res.status(403).json({
          error: "Недостаточно прав.",
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

  async delete(token: string, id: string, res: Response) {
    this.logger.info("Начинаем удаление комментария.")
    try {
      if (!id) {
        this.logger.error("Не получен id комметария.")
        res.status(400).json({
          error: "Не получен id комметария.",
        })
      }

      if (!token) {
        this.logger.error("Не получен токен пользователя.")
        res.status(403).json({
          error: "Вы не авторизованы.",
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

      if (decoded.role[0] != "ADMIN" && decoded._id != findComment.author) {
        this.logger.error("Недостаточно прав.")
        return res.status(403).json({
          error: "Недостаточно прав для изменения комментария.",
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
}
