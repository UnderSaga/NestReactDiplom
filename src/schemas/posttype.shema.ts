import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PostDocument = HydratedDocument<PostType>;

@Schema()
export class PostType {
  @Prop({ required: true })
  type: string;
}

export const PostTypeSchema = SchemaFactory.createForClass(PostType);
