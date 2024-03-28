import { IsEmail, Length, IsString } from "class-validator"

export class UserDto {
  @Length(3)
  username: string
  @IsEmail()
  email: string
  @IsString()
  @Length(4, 20)
  password: string
  avatarUrl?: string
}
