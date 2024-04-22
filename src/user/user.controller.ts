import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Headers,
  Patch,
  UploadedFile,
  UseInterceptors,
  Param,
  UseGuards,
} from "@nestjs/common"
import { UserService } from "./user.service"
import { Response } from "express"
import {
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from "@nestjs/swagger"
import { UpdateUserDto } from "./updateUser.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { diskStorage } from "multer"
import { IsAuthGuard } from "src/guards/is-auth/is-auth.guard"

@Controller("user")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) {}

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
