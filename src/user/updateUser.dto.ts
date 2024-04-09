import { IsEmail, Length, IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class UpdateUserDto {
  @Length(3)
  @ApiProperty({ example: "Admin" })
  username: string
  @IsEmail()
  @ApiProperty({ example: "admin@mail.ru" })
  email: string
  avatarUrl?: string
}
