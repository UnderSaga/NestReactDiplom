import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { UserService } from "./user.service"
import { UserDto } from "./user.dto"

@Controller("auth")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("registration")
  @UsePipes(new ValidationPipe())
  async registration(@Body() dto: UserDto) {
    return this.userService.create(dto)
  }

  @Get("login")
  async login(@Body() dto: UserDto) {
    return this.userService.login(dto)
  }
}
