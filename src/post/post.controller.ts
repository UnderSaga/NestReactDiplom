import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
  Patch,
  Delete,
  Headers,
  Query,
  UseGuards,
} from "@nestjs/common"
import { PostService } from "./post.service"
import { PostDto } from "./post.dto"
import { Response } from "express"
import {
  ApiAcceptedResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from "@nestjs/swagger"
import { HasRoleGuard } from "src/has-role/has-role.guard"
import { IsAuthGuard } from "src/is-auth/is-auth.guard"

@Controller("posts")
@ApiTags("Post")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(HasRoleGuard)
  @ApiCreatedResponse({
    description: "Статья успешно создана.",
  })
  @ApiForbiddenResponse({
    description: "Недостаточно прав для выполнения этого действия.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось создать статью.",
  })
  @UsePipes(new ValidationPipe())
  async createPost(@Body() dto: PostDto, @Res() res: Response) {
    return this.postService.create(dto, res)
  }

  @Get("?")
  @ApiCreatedResponse({
    description: "Список статей успешно получен.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось получить список статей.",
  })
  async getAll(
    @Res() res: Response,
    @Query("tag") tag?: string,
    @Query("name") name?: string,
    @Query("body") body?: string
  ) {
    return this.postService.getAll(res, tag, name, body)
  }

  @Get(":id")
  @ApiCreatedResponse({
    description: "Статья успешно получена.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось получить статью.",
  })
  async getOne(@Param("id") id: string, @Res() res: Response) {
    return this.postService.getOne(id, res)
  }

  @Get(":id/like")
  @UseGuards(IsAuthGuard)
  @ApiCreatedResponse({
    description: "Статья успешно лайкнута.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось лайкнуть статью.",
  })
  async likePost(
    @Param("id") id: string,
    @Res() res: Response,
    @Headers("authorization") token: string
  ) {
    return this.postService.likePost(id, res, token)
  }

  @Patch(":id")
  @UseGuards(HasRoleGuard)
  @ApiCreatedResponse({
    description: "Статья успешно обновлена.",
  })
  @ApiForbiddenResponse({
    description: "Недостаточно прав для выполнения этого действия.",
  })
  @ApiNotFoundResponse({
    description: "Статья не найдена.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось обновить статью.",
  })
  async updatePost(
    @Headers("authorization") token: string,
    @Body() dto: PostDto,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.postService.updatePost(token, dto, id, res)
  }

  @Delete(":id")
  @UseGuards(HasRoleGuard)
  @ApiCreatedResponse({
    description: "Статья успешно удалена.",
  })
  @ApiForbiddenResponse({
    description: "Недостаточно прав для выполнения этого действия.",
  })
  @ApiNotFoundResponse({
    description: "Статья не найдена.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось удалить статью.",
  })
  async deletePost(
    @Headers("authorization") token: string,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.postService.deletePost(token, id, res)
  }

  @Get("comments/:id?")
  @ApiAcceptedResponse({
    description: "Список комментариев успешно получен.",
  })
  @ApiNotFoundResponse({
    description: "Статья не найдена.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось получить список комментариев.",
  })
  async getComments(
    @Param("id") id: string,
    @Res() res: Response,
    @Query("sort") sort?: string
  ) {
    return this.postService.getComments(sort, id, res)
  }
}
