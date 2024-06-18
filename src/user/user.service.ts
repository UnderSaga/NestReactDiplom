import { Inject, Injectable, UnauthorizedException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "src/schemas/index.schema"
import { Model } from "mongoose"
import { JwtService } from "@nestjs/jwt"
import { Response } from "express"
import { Logger } from "winston"
import { UpdateUserDto } from "./updateUser.dto"
import { join } from "path"

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    @Inject("winston")
    private readonly logger: Logger
  ) {}

  async getMe(token: string, res: Response) {
    try {
      this.logger.info("Получение данных пользователя.")

      this.logger.info("Расшифровываем токен.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )

      this.logger.info("Ищем пользователя в базе данных.")
      const user = await this.userModel.findOne({
        _id: decoded._id,
      })

      if (!user) {
        this.logger.error("Пользователь не найден.")
        throw new UnauthorizedException()
      }

      const { username, email, roles, avatarUrl, createdAt } = user

      this.logger.info("Возвращаем данные пользователя.")
      res.json({
        username,
        email,
        roles,
        avatarUrl,
        withUs: createdAt.toLocaleDateString(),
      })
    } catch (error) {
      this.logger.error("Не удалось получить данные пользователя.")
      res.status(500).json({
        error: "Не удалось получить данные пользователя.",
      })
    }
  }

  async updateUser(token: string, res: Response, dto: UpdateUserDto) {
    try {
      this.logger.info("Начинаем смену данных пользователя.")

      this.logger.info("Расшифровываем токен.")
      const decoded = await this.jwtService.verify(
        token.replace(/Bearer\s?/, "")
      )
      this.logger.info("Ищем пользователя в базе данных.")
      const user = await this.userModel.findOne({
        _id: decoded._id,
      })

      if (!user) {
        this.logger.error("Пользователь не найден.")
        throw new UnauthorizedException()
      }

      console.log(dto.email, dto.username)

      if (dto.email) {
        if (dto.email === user.email) {
          return res.status(400).json({
            error: "Новая почта не должна совпадать со старой.",
          })
        }
        this.logger.info("Меняем почту пользователя.")
        await user.updateOne({
          email: dto.email,
        })
      }

      if (dto.username) {
        if (dto.username === user.username) {
          return res.status(400).json({
            error: "Новое имя не должно совпадать со старым.",
          })
        }
        this.logger.info("Меняем почту пользователя.")
        await user.updateOne({
          username: dto.username,
        })
      }

      this.logger.info("Данные успешно изменены.")
      res.json({
        message: "Данные успешно изменены.",
      })
    } catch (error) {
      this.logger.error("Не удалось изменить данные.")
      res.status(500).json({
        error: "Не удалось изменить данные.",
      })
    }
  }

  async changeAvatar(token: string, res: Response, file: Express.Multer.File) {
    try {
      this.logger.info("Начинаем смену аватара.")
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
      this.logger.info("Ищем пользователя в базе данных.")
      const user = await this.userModel.findOne({
        _id: decoded._id,
      })

      if (!user) {
        this.logger.error("Пользователь не найден.")
        throw new UnauthorizedException()
      }

      this.logger.info("Меняем аватар.")
      await user.updateOne({
        avatarUrl: file.filename,
      })

      this.logger.info("Аватар успешно изменен.")
      res.status(200).json(user)
    } catch (error) {
      this.logger.info("Не удалось изменить аватар.")
      res.status(500).json({
        error: "Не удалось изменить аватар.",
      })
    }
  }

  async getAvatar(avatarname: string, res: Response) {
    this.logger.info("Получаем изображение.")
    try {
      const avatarPath = join(process.cwd(), "uploads/avatars/", avatarname)

      this.logger.info("Возвращаем изображение.")
      res.sendFile(avatarPath)
    } catch (error) {
      this.logger.info("Не удалось получить изображение.")
      res.status(500).json({
        error: "Не удалось получть изображение.",
      })
    }
  }

  async getNameByID(id: string, res: Response) {
    this.logger.info("Получаем изображение.")
    try {
      this.logger.info("Ищем пользователя в базе данных.")
      const user = await this.userModel.findOne({
        _id: id,
      })

      res.json({name: user.username})
    } catch (error) {
      this.logger.info("Не удалось получить имя пользователя.")
      res.status(500).json({
        error: "Не удалось получть пользователя.",
      })
    }
  }
}
