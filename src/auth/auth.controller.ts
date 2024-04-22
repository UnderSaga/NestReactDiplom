import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger"
import { AuthDto } from "./auth.dto"
import { Response } from "express"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("registration")
  @ApiCreatedResponse({
    description: "Пользователь успешно зарегистрирован.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось создать пользователя.",
  })
  @UsePipes(new ValidationPipe())
  async registration(@Body() dto: AuthDto, @Res() res: Response) {
    return this.authService.registration(dto, res)
  }

  @Post("login")
  @ApiCreatedResponse({
    description: "Пользователь успешно авторизован.",
  })
  @ApiNotFoundResponse({
    description: "Пользователь не найден.",
  })
  @ApiBadRequestResponse({
    description: "Неверный логин или пароль.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось войти в учетную запись.",
  })
  async login(@Body() dto: AuthDto, @Res() res: Response) {
    return this.authService.login(dto, res)
  }

  @Post("refresh")
  async refresh(@Body("refresh") token: string, @Res() res: Response) {
    return this.authService.refresh(token, res)
  }
}
