import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, ObjectId } from "mongoose"

export type SessionDocument = HydratedDocument<Session>

@Schema()
export class Session {
  @Prop({ required: true })
  refToken: string

  @Prop()
  userAgent: string

  @Prop({ default: Date.now() })
  createdAt: Date
}

export const SessionSchema = SchemaFactory.createForClass(Session)
