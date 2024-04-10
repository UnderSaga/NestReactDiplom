import {
  CanActivate,
  ExecutionContext,
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
    const token = request.headers.authorization.replace("Bearer ", "")

    if (!token) {
      this.logger.error("Токен не получен.")
      throw new UnauthorizedException()
    }

    try {
      this.logger.info("Извлекаем данные из токена.")
      const payload = await this.jwtService.verifyAsync(token)
      if (payload) {
        this.logger.info("Пользователь прошел проверку.")
        return true
      }
    } catch {
      this.logger.info("Проверка на роль не пройдена.")
      throw new UnauthorizedException()
    }

    return false
  }
}
