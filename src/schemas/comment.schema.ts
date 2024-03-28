import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

export type CommentDocument = HydratedDocument<Comment>

@Schema()
export class Comment {
  @Prop({ required: true })
  comment: string

  @Prop({ required: true })
  @Prop({ type: { type: String, ref: "User" } })
  author: string

  @Prop({ required: true })
  @Prop({ default: false })
  changed: true

  @Prop({ default: Date.now })
  createdAt: Date
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
