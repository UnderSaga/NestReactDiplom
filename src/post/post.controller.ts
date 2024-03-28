import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
  Patch,
  Delete,
  Headers,
} from "@nestjs/common"
import { PostService } from "./post.service"
import { PostDto } from "./post.dto"
import { Request, Response } from "express"

@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createPost(
    @Headers("authorization") token: string,
    @Body() dto: PostDto,
    @Res() res: Response
  ) {
    return this.postService.create(token, dto, res)
  }

  @Get()
  async getAll(@Res() res: Response) {
    return this.postService.getAll(res)
  }

  @Get(":id")
  async getOne(@Param("id") id: string, @Res() res: Response) {
    return this.postService.getOne(id, res)
  }

  @Patch(":id")
  async updatePost(
    @Headers("authorization") token: string,
    @Body() dto: PostDto,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.postService.updatePost(token, dto, id, res)
  }

  @Delete(":id")
  async deletePost(
    @Headers("authorization") token: string,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.postService.deletePost(token, id, res)
  }

  @Get("comments/:id")
  async getComments(@Param("id") id: string, @Res() res: Response) {
    return this.postService.getComments(id, res)
  }
}
