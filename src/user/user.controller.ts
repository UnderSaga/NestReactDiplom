import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  Headers,
} from "@nestjs/common"
import { UserService } from "./user.service"
import { UserDto } from "./user.dto"
import { Response } from "express"

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

  @Get("me")
  async getMe(@Headers("authorization") token: string, @Res() res: Response) {
    return this.userService.getMe(token, res)
  }

  @Post("changeEmail")
  async changeEmail(
    @Headers("authorization") token: string,
    @Res() res: Response,
    @Body() dto: UserDto
  ) {
    return this.userService.changeEmail(token, res, dto)
  }
}
