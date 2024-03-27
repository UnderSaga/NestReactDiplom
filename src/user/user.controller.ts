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
import { Request, Response } from "express"

@Controller("auth")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("registration")
  @UsePipes(new ValidationPipe())
  async registration(@Body() dto: UserDto, @Res() res: Response) {
    return this.userService.create(dto, res)
  }

  @Post("login")
  @UsePipes(new ValidationPipe())
  async login(@Body() dto: UserDto, @Res() res: Response) {
    return this.userService.login(dto, res)
  }

  @Get("me")
  async getMe(@Body() dto: UserDto, @Req() req: Request, @Res() res: Response) {
    return this.userService.getMe(dto, req, res)
  }
}
