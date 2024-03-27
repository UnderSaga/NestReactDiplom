import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { UserService } from "./user.service"
import { UserDto } from "./user.dto"
import { Request, Response, request } from "express"

@Controller("auth")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("registration")
  @UsePipes(new ValidationPipe())
  async registration(@Body() dto: UserDto, @Res() res: Response) {
    return this.userService.create(dto, res)
  }

  @Post("login")
  async login(@Body() dto: UserDto, @Res() res: Response) {
    return this.userService.login(dto, res)
  }
}
