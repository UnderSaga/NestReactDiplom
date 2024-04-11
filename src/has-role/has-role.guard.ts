import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { response } from "express"
import { Logger } from "winston"

@Injectable()
export class HasRoleGuard implements CanActivate {
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
    const token = request.headers.authorization.replace("Bearer ", "")

    if (!token) {
      this.logger.error("Токен не получен.")
      response.status(401).json({
        error: "Пользователь не авторизован.",
      })
    }

    try {
      this.logger.info("Извлекаем данные пользователя.")
      const payload = await this.jwtService.verifyAsync(token)

      this.logger.info("Проверяем роль пользователя.")
      if (payload.role.includes("ADMIN")) {
        this.logger.info("Пользователь прошел проверку.")
        return true
      }
    } catch {
      this.logger.info("Проверка на роль не пройдена.")
      response.status(403).json({
        error: "Доступ запрещен.",
      })
    }

    return false
  }
}
