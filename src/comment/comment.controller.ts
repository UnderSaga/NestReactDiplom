import {
  Controller,
  Post,
  Body,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
  Patch,
  Delete,
  Headers,
  Get,
  UseGuards,
} from "@nestjs/common"
import { CommentService } from "./comment.service"
import { CommentDto } from "./comment.dto"
import { Response } from "express"
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from "@nestjs/swagger"
import { IsAuthGuard } from "src/is-auth/is-auth.guard"
import { HasRoleGuard } from "src/has-role/has-role.guard"

@Controller("comments")
@ApiTags("Comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(IsAuthGuard)
  @ApiCreatedResponse({
    description: "Комментарий успешно создан",
  })
  @ApiBadRequestResponse({
    description: "Комментарий не может быть пустым.",
  })
  @ApiNotFoundResponse({
    description: "Не удалось найти статью.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось создать комментарий.",
  })
  @UsePipes(new ValidationPipe())
  async createComment(
    @Headers("authorization") token: string,
    @Body() dto: CommentDto,
    @Res() res: Response
  ) {
    return this.commentService.create(token, dto, res)
  }

  @Patch(":id")
  @UseGuards(HasRoleGuard)
  @ApiCreatedResponse({
    description: "Комментарий успешно обновлен.",
  })
  @ApiNotFoundResponse({
    description: "Не удалось найти комментарий.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось обновить комментарий.",
  })
  async updateComment(
    @Headers("authorization") token: string,
    @Param("id") id: string,
    @Body() dto: CommentDto,
    @Res() res: Response
  ) {
    return this.commentService.update(id, dto, res, token)
  }

  @Delete(":id")
  @UseGuards(HasRoleGuard)
  @ApiCreatedResponse({
    description: "Комментарий успешно удален.",
  })
  @ApiNotFoundResponse({
    description: "Не удалось найти комментарий.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось удалить комментарий.",
  })
  async deleteComment(
    @Headers("authorization") token: string,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.commentService.delete(token, id, res)
  }

  @Get(":id/likes")
  @UseGuards(IsAuthGuard)
  @ApiCreatedResponse({
    description: "Комментарий успешно лайкнут.",
  })
  @ApiNotFoundResponse({
    description: "Не удалось найти комментарий.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось лайкнуть комментарий.",
  })
  async likeComment(
    @Headers("authorization") token: string,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.commentService.likeComment(token, id, res)
  }
}
