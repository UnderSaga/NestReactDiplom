import { IsEmail, Length } from "class-validator"

export class UserDto {
  @Length(3)
  username: string
  @IsEmail()
  email: string
  @Length(3)
  password: string
  avatarUrl?: string
}
