import { Length } from "class-validator";

export class CommentDto {
  @Length(5)
  comment: string;
}
