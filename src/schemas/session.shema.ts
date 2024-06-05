import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { HydratedDocument } from "mongoose"

export type SessionDocument = HydratedDocument<Session>

@Schema()
export class Session {
  @Prop({ required: true })
  refToken: string

  @Prop({ required: true })
  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: "User" }})
  userId: mongoose.Schema.Types.ObjectId

  @Prop()
  userAgent: string

  @Prop({ default: Date.now() })
  createdAt: Date
}

export const SessionSchema = SchemaFactory.createForClass(Session)
