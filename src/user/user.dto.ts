import { Min, isEmail, isString } from "class-validator"

export class UserDto {
  username: string
  email: string
  password: string
  avatarUrl?: string
}
