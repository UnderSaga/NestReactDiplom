import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Logger } from "winston"

@Injectable()
export class IsAuthGuard implements CanActivate {
  constructor(
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
      throw new UnauthorizedException({
        error: "Доступ запрещен.",
        description: "Токен пользователя не был получен.",
        statusCode: 401,
      })
    }

    try {
      this.logger.info("Извлекаем данные из токена.")
      const payload = await this.jwtService.verifyAsync(token)
      if (payload) {
        this.logger.info("Токен пользователя актуален.")
        return true
      }
    } catch {
      this.logger.info("Проверка на актуальность токена не пройдена.")
      throw new ForbiddenException({
        error: "Доступ запрещен.",
        description: "Был предоставлен неакутальный токен.",
        statusCode: 403,
      })
    }

    return false
  }
}
