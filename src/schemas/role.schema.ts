import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

export type UserDocument = HydratedDocument<Role>

@Schema()
export class Role {
  @Prop({ default: "USER" })
  value: string
}

export const RoleSchema = SchemaFactory.createForClass(Role)
