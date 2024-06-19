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

  @Prop({
    required: true,
  })
  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: "User" } })
  author: mongoose.Schema.Types.ObjectId

  @Prop({
    required: true,
  })
  authorName: string

  @Prop({ required: true, default: false })
  changed: boolean

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] })
  likes: mongoose.Schema.Types.ObjectId[]

  @Prop({ default: Date.now })
  createdAt: Date
}

export const CommentSchema = SchemaFactory.createForClass(Comment)
