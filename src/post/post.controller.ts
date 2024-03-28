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
} from "@nestjs/common"
import { PostService } from "./post.service"
import { PostDto } from "./post.dto"
import { Request, Response } from "express"

@Controller("posts")
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createPost(@Body() dto: PostDto, @Res() res: Response) {
    return this.postService.create(dto, res)
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
    @Body() dto: PostDto,
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.postService.updatePost(dto, id, res)
  }

  @Delete(":id")
  async deletePost(@Param("id") id: string, @Res() res: Response) {
    return this.postService.deletePost(id, res)
  }

  @Get("comments/:id")
  async getComments(@Param("id") id: string, @Res() res: Response) {
    return this.postService.getComments(id, res)
  }
}
