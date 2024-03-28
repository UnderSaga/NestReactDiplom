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
import { CommentService } from "./comment.service"
import { CommentDto } from "./comment.dto"
import { Response } from "express"

@Controller("comments")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(
    @Headers("authorization") token: string,
    @Body() dto: CommentDto,
    @Res() res: Response
  ) {
    return this.commentService.create(token, dto, res)
  }

  @Patch(":id")
  async updateComment(
    @Param("id") id: string,
    @Body() dto: CommentDto,
    @Res() res: Response
  ) {
    return this.commentService.update(id, dto, res)
  }

  @Delete(":id")
  async deleteComment(@Param("id") id: string, @Res() res: Response) {
    return this.commentService.delete(id, res)
  }
}
