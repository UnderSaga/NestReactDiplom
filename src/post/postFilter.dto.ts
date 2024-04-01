import { ApiProperty } from "@nestjs/swagger"

export class PostFilterDto {
  @ApiProperty({ example: "1 тег" })
  tag: string
}
