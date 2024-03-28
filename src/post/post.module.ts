import { Module } from "@nestjs/common"
import { PostService } from "./post.service"
import { PostController } from "./post.controller"
import { MongooseModule } from "@nestjs/mongoose"
import { Post, PostSchema } from "src/schemas/post.schema"
import { Comment, CommentSchema } from "src/schemas/comment.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
