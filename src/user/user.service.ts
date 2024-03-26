import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "src/schemas/user.schema"
import { Model } from "mongoose"
import { UserDto } from "./user.dto"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { Role } from "src/schemas/role.schema"
import { Request, Response } from "express"
import { userInfo } from "os"

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private jwtService: JwtService
  ) {}

  async create(userDto: UserDto, res: Response) {
    const password = userDto.password
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)
    const userRole = await this.roleModel.findOne({ value: "USER" })

    const user = new this.userModel({
      ...userDto,
      passwordHash: hash,
      roles: [userRole.value],
    })

    user.save()

    const token = this.jwtService.sign({
      _id: user._id,
      name: user.username,
    })

    const { passwordHash, ...userInfo } = user

    console.log(user)

    res.json({
      token,
      user,
    })
  }

  async login(userDto: UserDto, req: Request, res: Response) {
    const user = await this.userModel.findOne({ email: userDto.email })

    if (!user) {
      res.status(404).json({
        message: "Пользователь не найден.",
      })
    }

    user.save()

    res.json({
      user,
    })
  }
}
