import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { HydratedDocument } from "mongoose"

export type CommentDocument = HydratedDocument<Comment>

@Schema()
export class Comment {
  @Prop({ required: true })
  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: "Post" } })
  postId: mongoose.Schema.Types.ObjectId

  @Prop({ required: true })
  comment: string

  @Prop({ required: true })
  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: "User" } })
  author: mongoose.Schema.Types.ObjectId

  @Prop({ required: true })
  @Prop({ default: false })
  changed: true

  @Prop({ default: Date.now })
  createdAt: Date
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
