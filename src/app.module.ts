import { Module } from "@nestjs/common"
import { UserModule } from "./user/user.module"
import { PostModule } from "./post/post.module"
import { CommentModule } from "./comment/comment.module"
import { MongooseModule } from "@nestjs/mongoose"

@Module({
  imports: [
    UserModule,
    PostModule,
    CommentModule,
    MongooseModule.forRoot(
      "mongodb+srv://undersaga:Uq7123546E@mydb.zlgzmkd.mongodb.net/?retryWrites=true&w=majority&appName=mydb"
    ),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
