import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { HydratedDocument } from "mongoose"

export type PostDocument = HydratedDocument<Post>

@Schema()
export class Post {
  @Prop({ required: true })
  header: string

  @Prop({ required: true })
  body: string

  @Prop({ required: false })
  tags: string[]

  @Prop({ required: false })
  imageUrl: string

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }] })
  comments: mongoose.Schema.Types.ObjectId[]

  @Prop({ default: 0 })
  viewCount: number

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  })
  likes: mongoose.Schema.Types.ObjectId[]

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const PostSchema = SchemaFactory.createForClass(Post)
