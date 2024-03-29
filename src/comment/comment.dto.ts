import { IsString, Length } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CommentDto {
  @IsString()
  @ApiProperty({ example: "6604293001f43c3a994ca821" })
  postId: string
  @Length(5)
  @ApiProperty({ example: "Обычный коммент." })
  comment: string
}
