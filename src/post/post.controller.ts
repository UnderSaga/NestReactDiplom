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
import { ObjectId } from "mongoose"

@Controller("posts")
@ApiTags("Post")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
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
  async createPost(
    @Headers("authorization") token: string,
    @Body() dto: PostDto,
    @Res() res: Response
  ) {
    return this.postService.create(token, dto, res)
  }

  @Get()
  @ApiCreatedResponse({
    description: "Список статей успешно получен.",
  })
  @ApiInternalServerErrorResponse({
    description: "Не удалось получить список статей.",
  })
  async getAll(@Res() res: Response) {
    return this.postService.getAll(res)
  }

  @Get("findByTag")
  async filterPostsByTag(@Res() res: Response, @Query("tag") tag?: string) {
    return this.postService.filterPostsByTag(tag, res)
  }

  @Get("findByName")
  async filterPostsByName(@Res() res: Response, @Query("name") name?: string) {
    return this.postService.filterPostsByName(name, res)
  }

  @Get("findByBody")
  async filterPostsByBody(@Res() res: Response, @Query("body") body?: string) {
    return this.postService.filterPostsByBody(body, res)
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

  @Patch(":id")
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
    @Query("sort") sort: string,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.postService.getComments(sort, id, res)
  }
}
