import { Inject, Injectable, UnauthorizedException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "src/schemas/user.schema"
import { Model } from "mongoose"
import { UserDto } from "./user.dto"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { Role } from "src/schemas/role.schema"
import { Response } from "express"
import { Logger } from "winston"
import { UpdateUserDto } from "./updateUser.dto"
import { error } from "console"
import { join } from "path"

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private jwtService: JwtService,
    @Inject("winston")
    private readonly logger: Logger
  ) {}

  async create(userDto: UserDto, res: Response) {
    try {
      this.logger.info("Начало создания пользователя.")
      const { username, email, password } = userDto
      const candidate = await this.userModel.findOne({ email: email })

      if (candidate) {
        this.logger.error("Пользователь с такой почтой уже существует.")
        throw new Error()
      }
      const hash = await bcrypt.hash(password, 10)
      const userRole = await this.roleModel.findOne({ value: "USER" })

      this.logger.info("Создание модели пользователя.")
      const user = new this.userModel({
        email,
        username,
        password: hash,
        roles: [userRole.value],
      })

      this.logger.info("Сохранение пользователя в базу данных.")
      user.save()

      this.logger.info("Создание токена для пользователя.")
      const token = this.jwtService.sign({
        _id: user._id,
        name: user.username,
        role: user.roles,
      })

      this.logger.info(`Создан пользователь с токеном: ${token}`)
      res.json({ token })
    } catch (error) {
      this.logger.error("Не удалось создать пользователя.")
      res.status(500).json({
        error: "Не удалось создать пользователя.",
      })
    }
  }

  async login(userDto: UserDto, res: Response) {
    try {
      this.logger.info("Начало авторизации пользователя.")
      const user = await this.userModel.findOne({ email: userDto.email })

      if (!user) {
        this.logger.error("Пользователь не найден.")
        return res.status(404).json({
          message: "Пользователь не найден.",
        })
      }

      const isValidPass = await bcrypt.compare(userDto.password, user.password)

      if (!isValidPass) {
        this.logger.error("Пользователь ввел неверный пароль.")
        return res.status(400).json({
          message: "Неверный логин или пароль",
        })
      }

      this.logger.info("Генерация нового токена для пользователя.")
      const token = this.jwtService.sign({
        _id: user._id,
        name: user.username,
        role: user.roles,
      })

      this.logger.info("Пользователь авторизован.")
      res.json({
        token,
      })
    } catch (error) {
      this.logger.error("Не удалось войти в учетную запись.")
      res.status(500).json({
        error: "Не удалось войти в учетную запись.",
      })
    }
  }

  async getMe(token: string, res: Response) {
    try {
      this.logger.info("Получение данных пользователя.")
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

      const { username, email, roles, avatarUrl } = user

      this.logger.info("Возвращаем данные пользователя.")
      res.json({ username, email, roles, avatarUrl })
    } catch (error) {
      this.logger.error("Не удалось получить данные пользователя.")
      res.status(500).json({
        error: "Не удалось получить данные пользователя.",
      })
    }
  }

  async updateUser(token: string, res: Response, dto: UpdateUserDto) {
    try {
      this.logger.info("Начинаем смену пароля.")
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
      this.logger.info("Начинаем смену пароля.")
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
}
