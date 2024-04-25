import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { HydratedDocument, ObjectId } from "mongoose"

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: false })
  avatarUrl: string

  @Prop({ type: [{ type: String, ref: "Role" }] })
  roles: string[]

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: "Session" }] })
  session: mongoose.Types.ObjectId[]

  @Prop({ default: Date.now() })
  createdAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
