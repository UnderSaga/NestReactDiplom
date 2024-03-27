import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CommentDto } from "./comment.dto";
import { Comment } from "src/schemas/comment.schema";
import { Response } from "express";

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>
  ) {}

  async create(dto: CommentDto, res: Response) {
    const { comment, ...CommentDto } = dto;
  }
}
