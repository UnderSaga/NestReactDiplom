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
} from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CommentDto } from "./comment.dto";
import { Response } from "express";

@Controller("comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async createComment(@Body() dto: CommentDto, @Res() res: Response) {
    return this.commentService.create(dto, res);
  }
}
