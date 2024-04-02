import { Module } from "@nestjs/common"
import { UserModule } from "./user/user.module"
import { PostModule } from "./post/post.module"
import { CommentModule } from "./comment/comment.module"
import { MongooseModule } from "@nestjs/mongoose"
import { WinstonModule } from "nest-winston"
import { transports, format } from "winston"

@Module({
  imports: [
    UserModule,
    PostModule,
    CommentModule,
    MongooseModule.forRoot(
      "mongodb+srv://undersaga:Uq7123546E@mydb.zlgzmkd.mongodb.net/?retryWrites=true&w=majority&appName=mydb"
    ),
    WinstonModule.forRoot({
      format: format.combine(format.timestamp(), format.prettyPrint()),
      transports: [
        new transports.Console(),
        new transports.File({
          dirname: "./log/debug/",
          filename: "debug.log",
          level: "debug",
          maxsize: Number(process.env.MAX_SIZE_FOR_LOGS),
        }),
        new transports.File({
          dirname: "./log/warning/",
          filename: "warning.log",
          level: "warn",
          maxsize: Number(process.env.MAX_SIZE_FOR_LOGS),
        }),
        new transports.File({
          dirname: "./log/info/",
          filename: "info.log",
          level: "info",
          maxsize: Number(process.env.MAX_SIZE_FOR_LOGS),
        }),
        new transports.File({
          dirname: "./log/error/",
          filename: "error.log",
          level: "error",
          maxsize: Number(process.env.MAX_SIZE_FOR_LOGS),
        }),
      ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
