import { Module } from "@nestjs/common";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Post,
  PostSchema,
  Comment,
  CommentSchema,
} from "src/schemas/index.schema";
import { PostType, PostTypeSchema } from "src/schemas/posttype.shema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: PostType.name, schema: PostTypeSchema},
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
