import { Module } from "@nestjs/common"
import { UserModule } from "./user/user.module"
import { PostModule } from "./post/post.module"
import { CommentModule } from "./comment/comment.module"
import { MongooseModule } from "@nestjs/mongoose"
import { WinstonModule } from "nest-winston"
import * as winston from "winston"

@Module({
  imports: [
    UserModule,
    PostModule,
    CommentModule,
    MongooseModule.forRoot(
      "mongodb+srv://undersaga:Uq7123546E@mydb.zlgzmkd.mongodb.net/?retryWrites=true&w=majority&appName=mydb"
    ),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          dirname: "src/../log/debug/",
          filename: "debug.log",
          level: "debug",
          maxsize: Number(process.env.MAX_SIZE_FOR_LOGS),
        }),
        new winston.transports.File({
          dirname: "src/../log/warning/",
          filename: "warning.log",
          level: "warn",
          maxsize: Number(process.env.MAX_SIZE_FOR_LOGS),
        }),
        new winston.transports.File({
          dirname: "src/../log/info/",
          filename: "info.log",
          level: "log",
          maxsize: Number(process.env.MAX_SIZE_FOR_LOGS),
        }),
        new winston.transports.File({
          dirname: "src/../log/error/",
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
