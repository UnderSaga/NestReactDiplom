import { Length } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class PostDto {
  @Length(5)
  @ApiProperty({ example: "Топовая статья." })
  header: string

  @Length(5)
  @ApiProperty({ example: "Тело топовой статьи." })
  body: string

  @ApiProperty({ example: ["1 тег", "2 тег"] })
  tags: string[]

  imageUrl: string
}
