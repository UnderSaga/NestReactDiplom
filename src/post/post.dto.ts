import { Optional } from "@nestjs/common"
import { IsUrl, Length } from "class-validator"

export class PostDto {
  @Length(5)
  header: string

  @Length(5)
  body: string

  tags: string[]

  @Optional()
  imageUrl: string
}
