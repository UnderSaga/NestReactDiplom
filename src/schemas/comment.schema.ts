import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

export type CommentDocument = HydratedDocument<Comment>

@Schema()
export class Comment {
  @Prop({ required: true })
  postId: string

  @Prop({ required: true })
  comment: string

  @Prop({ type: { type: String, ref: "User" } })
  author: string

  @Prop({ default: Date.now })
  createdAt: Date
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
