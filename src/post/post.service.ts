import { Inject, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { PostDto } from "./post.dto"
import { Post, Comment } from "src/schemas/index.schema"
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

  async create(postDto: PostDto, res: Response) {
    try {
      this.logger.info("Начало создания статьи.")

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

  async getAll(res: Response, tagReq?: string, name?: string, body?: string) {
    try {
      this.logger.info("Начинаем получение статей.")
      let posts = await this.postModel.find()

      if (tagReq) {
        this.logger.info("Сортируем статьи по тегу.")
        posts = posts.filter((post) => {
          if (
            post.tags.filter((tag) => {
              if (tag.includes(tagReq)) return tag
            }).length > 0
          ) {
            return post
          }
        })
      }

      if (name) {
        this.logger.info("Сортируем статьи по названию.")
        posts = posts.filter((post) => {
          if (post.header.includes(name)) {
            return post
          }
        })
      }

      if (body) {
        this.logger.info("Сортируем статьи по содержанию.")
        posts = posts.filter((post) => {
          if (post.body.includes(body)) {
            return post
          }
        })
      }

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

  async getLatestLiked(res: Response, token: string) {
    try {
      this.logger.info("Начинаем получение лайкнутых статей.")
      this.logger.info("Расщифровываем токен.")
      const decoded = await this.jwtService.decode(
        token.replace(/Bearer\s?/, "")
      )

      this.logger.info("Получаем все статьи.")
      const allPosts = await this.postModel.find()

      if (!allPosts) {
        this.logger.info("Не удалось получить список всех статей.")
        res.status(404).json({
          error: "Не удалось получить список всех статей.",
        })
      }

      this.logger.info("Фильтруем полученные статьи.")
      const likedPosts = allPosts.filter((post) => {
        if (post.likes.includes(decoded._id)) return post
      })

      this.logger.info("Возвращаем полученный список статей.")
      res.json({ posts: likedPosts })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось получить последние лайкнутые посты.",
      })
    }
  }

  async likePost(id: string, res: Response, token: string) {
    try {
      this.logger.info("Лайкаем статью.")
      if (!id) {
        this.logger.error("Пользователь не передал id статьи.")
        return res.status(400).json({
          error: "Пользователь не передал id статьи.",
        })
      }

      this.logger.info("Расшифровываем токен пользователя.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      this.logger.info("Ищем статью в базе данных.")
      const post = await this.postModel.findById(id)

      if (!post) {
        this.logger.error("Статья не найдена.")
        return res.status(404).json({
          error: "Статья не найдена.",
        })
      }

      let state: boolean

      if (post.likes.includes(decoded._id)) {
        this.logger.info("Удаляем лайк.")
        await post.updateOne(
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
        await post.updateOne(
          {
            $push: { likes: decoded._id },
          },
          {
            returnDocument: "after",
          }
        )
        state = true
      }

      const { likes } = await this.postModel.findById(id)
      this.logger.info("Возвращаем статью с лайком.")
      res.json({ state, likes })
    } catch (error) {
      this.logger.error("Не удалось лайкнуть статью.")
      res.status(500).json({
        error: "Не удалось лайкнуть статью.",
      })
    }
  }

  async updatePost(dto: PostDto, id: string, res: Response) {
    this.logger.info("Начинаем обновление статьи.")
    try {
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

  async deletePost(id: string, res: Response) {
    this.logger.info("Начинаем удаление статьи.")
    try {
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
          return res.json(list)
      }
    } catch (error) {
      this.logger.error("Не удалось получить список комментариев.")
      res.status(500).json({
        error: "Не удалось получить список комментариев.",
      })
    }
  }
}
