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
import { HasRoleGuard, IsAuthGuard } from "../guards/index.guards"

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

  @Get("latest")
  @ApiCreatedResponse({
    description: "Список статей успешно получен.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось получить список статей.",
  })
  async getLiked(
    @Res() res: Response,
    @Headers("authorization") token: string
  ) {
    return this.postService.getLatestLiked(res, token)
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

  @Patch(":id/like")
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
    @Body() dto: PostDto,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.postService.updatePost(dto, id, res)
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
  async deletePost(@Param("id") id: string, @Res() res: Response) {
    return this.postService.deletePost(id, res)
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
