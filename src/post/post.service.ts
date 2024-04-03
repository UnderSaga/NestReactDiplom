import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Comment } from "src/schemas/comment.schema"
import { Model } from "mongoose"
import { PostDto } from "./post.dto"
import { Post } from "src/schemas/post.schema"
import { Response } from "express"
import { JwtService } from "@nestjs/jwt"
import { Logger } from "winston"

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private jwtService: JwtService,
    @Inject("winston")
    private readonly logger: Logger
  ) {}

  async create(token: string, postDto: PostDto, res: Response) {
    try {
      this.logger.info("Начало создания статьи.")
      if (!token) {
        this.logger.error("Не передан токен.")
        res.status(403).json({
          message: "Вы не авторизованы.",
        })
      }
      this.logger.info("Расшифровываем токен.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      if (decoded.role[0] != "ADMIN") {
        this.logger.warn("Недостаточно прав.")
        return res.status(403).json({
          message: "Недостаточно прав для создания статьи.",
        })
      }

      this.logger.info("Создаем модельку статьи.")
      const doc = new this.postModel({
        header: postDto.header,
        body: postDto.body,
        tags: postDto.tags,
        imageUrl: postDto.imageUrl,
      })

      this.logger.info("Сохраняем статью в базу данных.")
      await doc.save()

      this.logger.info("Закончили создание статьи.")
      res.json(doc)
    } catch (err) {
      this.logger.error("Не удалось создать статью.")
      res.status(500).json({
        message:
          "Не удалось создать статью. Возможно, статья с таким заголовком уже существует.",
      })
    }
  }

  async getAll(res: Response) {
    try {
      this.logger.info("Начинаем получение статей.")
      const posts = await this.postModel.find()

      this.logger.info("Возвращаем полученные статьи.")
      res.json(posts)
    } catch (error) {
      this.logger.error("Не удалось получить список статей.")
      res.status(500).json({
        error: "Не удалось получить список статей.",
      })
    }
  }

  async getOne(id: string, res: Response) {
    try {
      this.logger.info("Начинаем получение одной статьи.")
      if (!id) {
        this.logger.error("Пользователь не передал id статьи.")
        res.status(400).json({
          message: "Пользователь не передал id статьи.",
        })
      }

      this.logger.info("Ищем статью в базе данных.")
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
            this.logger.error("Статья не найдена.")
            return res.status(404).json({
              message: "Статья не найдена.",
            })
          }

          this.logger.info("Возвращаем полученную стать.")
          res.json(doc)
        })
    } catch (error) {
      this.logger.error("Не удалось получить статью.")
      res.status(500).json({
        error: "Не удалось получить статью.",
      })
    }
  }

  async updatePost(token: string, dto: PostDto, id: string, res: Response) {
    this.logger.info("Начинаем обновление статьи.")
    try {
      if (!token) {
        this.logger.error("Не получен токен пользователя.")
        res.status(403).json({
          message: "Вы не авторизованы.",
        })
      }

      this.logger.info("Расшифровываем токен пользователя.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      if (decoded.role[0] != "ADMIN") {
        this.logger.error("Недостаточно прав.")
        return res.status(403).json({
          message: "Недостаточно прав для изменения статьи.",
        })
      }

      this.logger.info("Создаем новую модельку статьи.")
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
            this.logger.error("Статья не найдена.")
            return res.status(404).json({
              message: "Статья не найдена.",
            })
          }

          this.logger.info("Статья успешно обновлена.")
          res.json({ message: "Статья успешно обновлена" })
        })
    } catch (error) {
      this.logger.error("Не удалось обновить статью.")
      res.status(500).json({
        message:
          "Не удалось обновить статью. Возможно, статья с таким заголовком уже существует.",
      })
    }
  }

  async deletePost(token: string, id: string, res: Response) {
    this.logger.info("Начинаем удаление статьи.")
    try {
      if (!token) {
        this.logger.error("Не получен токен пользователя.")
        res.status(403).json({
          message: "Вы не авторизованы.",
        })
      }

      this.logger.info("Расшифровываем токен.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      if (decoded.role[0] != "ADMIN") {
        this.logger.error("Недостаточно прав.")
        return res.status(403).json({
          message: "Недостаточно прав для удаления статьи.",
        })
      }

      this.logger.info("Ищем и удаляем статью.")
      await this.postModel.findByIdAndDelete(id).then((doc) => {
        if (!doc) {
          this.logger.error("Статья не найдена.")
          throw new Error()
        }

        this.logger.info("Удаление завершено.")
        res.json({
          message: "Статья успешно удалена",
        })
      })
    } catch (error) {
      this.logger.error("Не удалось удалить статью.")
      res.status(500).json({
        error: "Не удалось удалить статью.",
      })
    }
  }

  async getComments(sort: string, id: string, res: Response) {
    this.logger.info("Начинаем получение комментариев под статьей.")
    try {
      this.logger.info("Ищем статью.")
      const post = await this.postModel.findById(id)

      if (!post) {
        this.logger.error("Статья не найдена.")
        return res.status(404).json({
          message: "Статья не найдена.",
        })
      }

      this.logger.info("Получем список комментариев.")
      const list = await Promise.all(
        post.comments.map((comment) => {
          const item = this.commentModel.findById(comment)
          if (!item) {
            return false
          }
          return item
        })
      )

      this.logger.info("Возвращаем список комментраиев.")
      switch (sort) {
        case "asc":
          return res.json(list.reverse())
        default:
          res.json(list)
      }
    } catch (error) {
      this.logger.error("Не удалось получить список комментариев.")
      res.status(500).json({
        error: "Не удалось получить список комментариев.",
      })
    }
  }

  async filterPostsByTag(tag: string, res: Response) {
    this.logger.info("Начнинаем фильтрацию статей.")
    try {
      this.logger.info("Получем список статей.")
      const posts = await this.postModel.find()

      this.logger.info("Фильтруем статьи по полученному тегу.")
      const list = posts.filter((item) => {
        if (item.tags.includes(tag)) {
          return item
        }
      })

      this.logger.info("Возвращаем отфильтрованный список статей.")
      res.json(list)
    } catch (error) {
      this.logger.error("Не удалось отфильтровать список статей.")
      res.status(500).json({
        message: error,
      })
    }
  }

  async filterPostsByName(name: string, res: Response) {
    this.logger.info("Начнинаем фильтрацию статей.")
    try {
      this.logger.info("Получем список статей.")
      const posts = await this.postModel.find()

      this.logger.info("Фильтруем статьи по полученному названию.")
      const list = posts.filter((item) => {
        if (item.header.includes(name)) {
          return item
        }
      })

      this.logger.info("Возвращаем отфильтрованный список статей.")
      res.json(list)
    } catch (error) {
      this.logger.error("Не удалось отфильтровать список статей.")
      res.status(500).json({
        message: error,
      })
    }
  }

  async filterPostsByBody(body: string, res: Response) {
    this.logger.info("Начнинаем фильтрацию статей.")
    try {
      this.logger.info("Получем список статей.")
      const posts = await this.postModel.find()

      this.logger.info("Фильтруем статьи по полученному содержанию.")
      const list = posts.filter((item) => {
        if (item.body.includes(body)) {
          return item
        }
      })

      this.logger.info("Возвращаем отфильтрованный список статей.")
      res.json(list)
    } catch (error) {
      this.logger.error("Не удалось отфильтровать список статей.")
      res.status(500).json({
        message: error,
      })
    }
  }
}
