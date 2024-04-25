import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { ConfigModule } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import {
  User,
  UserSchema,
  Role,
  RoleSchema,
  Session,
  SessionSchema,
} from "src/schemas/index.schema"
import { JwtModule } from "@nestjs/jwt"
import { TokenGenerator } from "src/utils/tokenGenerator.utils"

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenGenerator],
})
export class AuthModule {}
