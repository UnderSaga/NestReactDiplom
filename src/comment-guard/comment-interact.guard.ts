import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Logger } from "winston"
import { Comment } from "src/schemas/comment.schema"
import { response } from "express"

@Injectable()
export class CommentGuard implements CanActivate {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private jwtService: JwtService,
    @Inject("winston")
    private readonly logger: Logger
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.info("Начинаем проверку пользователя на авторизацию.")
    this.logger.info("Получаем данные запроса.")
    const request = context.switchToHttp().getRequest()

    this.logger.info("Извлекаем токен.")
    const token = request.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      this.logger.error("Токен не получен.")
      throw new ForbiddenException({
        error: "Доступ запрещен.",
        description: "Токен пользователя не был получен.",
        statusCode: 401,
      })
    }

    try {
      this.logger.info("Извлекаем данные пользователя.")
      const payload = await this.jwtService.verifyAsync(token)

      this.logger.info("Проверяем роль пользователя.")
      if (payload.role.includes("ADMIN")) {
        this.logger.info("Пользователь прошел проверку на роль.")
        return true
      }

      const comment = await this.commentModel.findById(request.params.id)

      this.logger.info(
        "Проверяем, является ли пользователь автором комментария."
      )
      if (comment.author == payload._id) {
        this.logger.info("Пользователь прошел проверку на авторство.")
        return true
      } else {
        throw new ForbiddenException({
          error: "Доступ запрещен.",
          description: "Пользователь не является автором комментария.",
          statusCode: 403,
        })
      }
    } catch {
      this.logger.error("Доступ запрещен.")
      throw new ForbiddenException({
        error: "Доступ запрещен.",
        description: "Был предоставлен неакутальный токен.",
        statusCode: 403,
      })
    }

    return false
  }
}
