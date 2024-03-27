import { Injectable, UnauthorizedException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "src/schemas/user.schema"
import { Model } from "mongoose"
import { UserDto } from "./user.dto"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { Role } from "src/schemas/role.schema"
import { Request, Response } from "express"

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private jwtService: JwtService
  ) {}

  async create(userDto: UserDto, res: Response) {
    try {
      const { username, email, password } = userDto
      const candidate = await this.userModel.findOne({ email: email })
      if (candidate) {
        throw new Error()
      }
      const hash = await bcrypt.hash(password, 10)
      const userRole = await this.roleModel.findOne({ value: "USER" })

      const user = new this.userModel({
        email,
        username,
        password: hash,
        roles: [userRole.value],
      })

      user.save()

      const token = this.jwtService.sign({
        _id: user._id,
        name: user.username,
      })

      res.json({ token })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось создать пользователя.",
      })
    }
  }

  async login(userDto: UserDto, res: Response) {
    try {
      const user = await this.userModel.findOne({ email: userDto.email })

      if (!user) {
        res.status(404).json({
          message: "Пользователь не найден.",
        })
      }

      const isValidPass = await bcrypt.compare(userDto.password, user.password)

      if (!isValidPass) {
        return res.status(400).json({
          message: "Неверный логин или пароль",
        })
      }

      const token = this.jwtService.sign({
        _id: user._id,
        name: user.username,
      })

      const { _id, username, email, roles } = user

      res.json({
        _id,
        username,
        email,
        roles,
        token,
      })
    } catch (error) {
      res.status(500).json({
        error: "Не удалось войти в учетную запись.",
      })
    }
  }

  async getMe(userDto: UserDto, req: Request, res: Response) {
    try {
      const token = (req.headers.authorization || "").replace(/Bearer\s?/, "")
      const decoded = this.jwtService.verify(token)
      const user = await this.userModel.findById(decoded._id)

      if (!user) {
        throw new UnauthorizedException()
      }

      res.json(user)
    } catch (error) {}
  }
}
