import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Role } from "src/schemas/role.schema"
import { User } from "src/schemas/user.schema"
import { Logger } from "winston"
import { AuthDto } from "./auth.dto"
import * as bcrypt from "bcryptjs"
import { randomBytes } from "crypto"
import { Response } from "express"

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject("winston")
    private readonly logger: Logger,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async registration(authDto: AuthDto, res: Response) {
    try {
      this.logger.info("Начало создания пользователя.")
      const { username, email, password } = authDto
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
        session: "",
      })

      const codeForRefToken = randomBytes(10)
      this.logger.info("Создание refresh-токена для пользователя.")
      const refToken = this.jwtService.sign(
        {
          code: codeForRefToken,
          _id: user._id,
        },
        {
          expiresIn: "30d",
        }
      )

      user.session = refToken

      this.logger.info("Создание токена для пользователя.")
      const accessToken = this.jwtService.sign({
        _id: user._id,
        name: user.username,
        role: user.roles,
      })

      this.logger.info("Сохранение пользователя в базу данных.")
      user.save()

      this.logger.info(`Создан пользователь с токеном: ${accessToken}`)
      res.json({ accessToken, refToken })
    } catch (error) {
      this.logger.error("Не удалось создать пользователя.")
      res.status(500).json({
        error: "Не удалось создать пользователя.",
      })
    }
  }

  async login(authDto: AuthDto, res: Response) {
    try {
      this.logger.info("Начало авторизации пользователя.")
      const user = await this.userModel.findOne({ email: authDto.email })

      if (!user) {
        this.logger.error("Пользователь не найден.")
        return res.status(404).json({
          message: "Пользователь не найден.",
        })
      }

      const isValidPass = await bcrypt.compare(authDto.password, user.password)

      if (!isValidPass) {
        this.logger.error("Пользователь ввел неверный пароль.")
        return res.status(400).json({
          message: "Неверный логин или пароль",
        })
      }

      const codeForRefToken = randomBytes(10)
      this.logger.info("Генерация нового refresh-токена для пользователя.")
      const refToken = this.jwtService.sign(
        {
          code: codeForRefToken.toString(),
          _id: user._id,
        },
        {
          expiresIn: "30d",
        }
      )

      user.session = refToken

      this.logger.info("Генерация нового токена для пользователя.")
      const accessToken = this.jwtService.sign({
        _id: user._id,
        name: user.username,
        role: user.roles,
      })

      user.save()

      this.logger.info("Пользователь авторизован.")
      res.json({ accessToken, refToken })
    } catch (error) {
      this.logger.error("Не удалось войти в учетную запись.")
      res.status(500).json({
        error: "Не удалось войти в учетную запись.",
      })
    }
  }

  async refresh(refToken: string, res: Response) {
    try {
      this.logger.info("Проверка рефреш-токена.")
      if (!this.jwtService.verify(refToken)) {
        throw new UnauthorizedException("Рефреш-токен не является подлиным.")
      }

      this.logger.info("Получение пользователя из рефреш-токена.")
      const { _id } = this.jwtService.decode(refToken)
      const user = await this.userModel.findById(_id)

      console.log(user.session)

      if (user.session != refToken) {
        throw new ForbiddenException()
      }

      const codeForRefToken = randomBytes(10)
      this.logger.info("Генерация нового refresh-токена для пользователя.")
      const newRefToken = this.jwtService.sign(
        {
          code: codeForRefToken.toString(),
          _id: user._id,
        },
        {
          expiresIn: "30d",
        }
      )

      user.session = newRefToken

      this.logger.info("Генерация нового токена для пользователя.")
      const accessToken = this.jwtService.sign({
        _id: user._id,
        name: user.username,
        role: user.roles,
      })

      user.save()

      this.logger.info("Возвращаем новые токены.")
      res.json({ accessToken, refToken: newRefToken })
    } catch (error) {
      this.logger.error("Не удалось обновить токен пользователя.")
      res.status(500).json({
        error: "Не удалось обновить токен пользователя.",
      })
    }
  }
}
