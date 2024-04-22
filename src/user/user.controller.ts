import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
  Headers,
  Patch,
  UploadedFile,
  UseInterceptors,
  Param,
  UseGuards,
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
import { UpdateUserDto } from "./updateUser.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { HasRoleGuard } from "src/guards/has-role/has-role.guard"
import { IsAuthGuard } from "src/guards/is-auth/is-auth.guard"

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
  @UseGuards(IsAuthGuard)
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

  @Patch("newUserData")
  @UseGuards(IsAuthGuard)
  async updateUser(
    @Headers("authorization") token: string,
    @Res() res: Response,
    @Body() dto: UpdateUserDto
  ) {
    return this.userService.updateUser(token, res, dto)
  }

  @Post("avatar")
  @UseGuards(IsAuthGuard)
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage({
        destination: "./uploads/avatars",
        filename: (_, file, cb) => {
          const extIndex = file.originalname.lastIndexOf(".")
          cb(
            null,
            `${file.originalname.slice(0, extIndex)}${Date.now()}${file.originalname.slice(extIndex)}`
          )
        },
      }),
    })
  )
  async changeAvatar(
    @Headers("authorization") token: string,
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.userService.changeAvatar(token, res, file)
  }

  @Get("avatar/:imagename")
  async getAvatar(@Param("imagename") image: string, @Res() res: Response) {
    return this.userService.getAvatar(image, res)
  }
}
