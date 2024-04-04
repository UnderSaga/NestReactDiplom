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

      const { username, email, roles } = user

      this.logger.info("Возвращаем данные пользователя.")
      res.json({ username, email, roles })
    } catch (error) {
      this.logger.error("Не удалось получить данные пользователя.")
      res.status(500).json({
        error: "Не удалось получить данные пользователя.",
      })
    }
  }

  async changeEmail(token: string, res: Response, dto: UserDto) {
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

      this.logger.info("Меняем почту пользователя.")
      await this.userModel.findOneAndUpdate(
        {
          _id: decoded._id,
        },
        {
          email: dto.email,
        }
      )

      this.logger.info("Почта успешно изменена.")
      res.json({
        message: "Почта успешно изменена.",
      })
    } catch (error) {
      this.logger.error("Не удалось сменить почту.")
      res.status(500).json({
        error: "Не удалось изменить почту.",
      })
    }
  }
}
