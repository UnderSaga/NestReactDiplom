import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

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

  @Prop({ type: [{ type: String, ref: "Comment" }] })
  comments: string[]

  @Prop({ default: 0 })
  viewCount: number

  @Prop({ default: Date.now })
  createdAt: Date
}

export const PostSchema = SchemaFactory.createForClass(Post)
