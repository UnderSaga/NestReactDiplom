import { IsString, Length } from "class-validator"

export class CommentDto {
  @IsString()
  postId: string
  @Length(5)
  comment: string
}
