import { Module } from "@nestjs/common"
import { UserService } from "./user.service"
import { UserController } from "./user.controller"
import { MongooseModule } from "@nestjs/mongoose"
import { User, UserSchema } from "src/schemas/user.schema"
import { Role, RoleSchema } from "src/schemas/role.schema"
import { JwtModule } from "@nestjs/jwt"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
