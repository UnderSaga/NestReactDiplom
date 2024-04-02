import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  Headers,
  Logger,
} from "@nestjs/common"
import { UserService } from "./user.service"
import { UserDto } from "./user.dto"
import { Response } from "express"
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from "@nestjs/swagger"
import { WinstonLogger } from "nest-winston"

@Controller("auth")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("registration")
  @ApiCreatedResponse({
    description: "Пользователь успешно зарегистрирован.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось создать пользователя.",
  })
  @UsePipes(new ValidationPipe())
  async registration(@Body() dto: UserDto, @Res() res: Response) {
    return this.userService.create(dto, res)
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
  async login(@Body() dto: UserDto, @Res() res: Response) {
    return this.userService.login(dto, res)
  }

  @Get("me")
  @ApiCreatedResponse({
    description: "Данные пользователя успешно получены.",
  })
  @ApiNotFoundResponse({
    description: "Пользователь не найден.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось получить данные пользователя.",
  })
  async getMe(@Headers("authorization") token: string, @Res() res: Response) {
    return this.userService.getMe(token, res)
  }

  @Post("changeEmail")
  @ApiCreatedResponse({
    description: "Почта успешно изменена.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось изменить почту.",
  })
  async changeEmail(
    @Headers("authorization") token: string,
    @Res() res: Response,
    @Body() dto: UserDto
  ) {
    return this.userService.changeEmail(token, res, dto)
  }
}
