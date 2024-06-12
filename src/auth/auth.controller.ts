import {
  Body,
  Controller,
  Patch,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  Headers,
  Delete,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from "@nestjs/swagger"
import { AuthDto } from "./auth.dto"
import { Response } from "express"

@ApiTags("Auth")
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
  async login(
    @Headers("user-agent") ua: string,
    @Body() dto: AuthDto,
    @Res() res: Response
  ) {
    return this.authService.login(ua, dto, res)
  }

  @Patch("refresh")
  @ApiCreatedResponse({
    description: "Пользователь успешно авторизован.",
  })
  @ApiNotFoundResponse({
    description: "Сессия не найдена.",
  })
  @ApiBadRequestResponse({
    description: "Пользователь не передал рефреш-токен.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось обновить сессию.",
  })
  async refresh(
    @Headers("user-agent") ua: string,
    @Body("refresh") token: string,
    @Res() res: Response
  ) {
    return this.authService.refresh(ua, token, res)
  }

  @Delete("logout")
  async logout(@Body("refresh") token: string, @Res() res: Response) {
    return this.authService.logout(token, res)
  }
}
