import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "src/schemas/user.schema"
import { Model } from "mongoose"
import { UserDto } from "./user.dto"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { Role } from "src/schemas/role.schema"
import { json } from "stream/consumers"

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private jwtService: JwtService
  ) {}

  async create(userDto: UserDto): Promise<User> {
    const password = userDto.password
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)
    const userRole = await this.roleModel.findOne({ value: "USER" })

    const user = new this.userModel({
      ...userDto,
      passwordHash,
      roles: [userRole.value],
    })

    user.save()

    return user
  }

  async login(userDto: UserDto): Promise<User> {
    const password = userDto.password
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)
    const userRole = await this.roleModel.findOne({ value: "USER" })

    const createdUser = new this.userModel({
      ...userDto,
      passwordHash,
      roles: [userRole.value],
    })
    return createdUser.save()
  }
}
