import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
  @Prop({ required: true })
  username: string

  @Prop({ required: true })
  email: string

  passwordHash: string

  avatarUrl: string

  @Prop({ type: [{ type: String, ref: "Role" }] })
  roles: string[]

  @Prop({ default: Date.now })
  createdAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
