import { IsEmail, Length, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class AuthDto {
  @Length(3)
  @ApiProperty({ example: "Admin" })
  username: string
  @IsEmail()
  @ApiProperty({ example: "admin@mail.ru" })
  email: string
  @IsString()
  @Length(4, 20)
  @ApiProperty({ example: "AdminPass" })
  password: string
  avatarUrl?: string
}
