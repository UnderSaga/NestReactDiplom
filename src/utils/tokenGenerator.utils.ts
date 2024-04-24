import { JwtService } from "@nestjs/jwt"
import jwt from "jsonwebtoken"
import { randomBytes } from "crypto"
import { InternalServerErrorException } from "@nestjs/common"

export class TokenGenerator {
  constructor(private jwtService: JwtService) {}

  async generateAccessToken(payload: object): Promise<string> {
    this.jwtService = new JwtService({
      secret: process.env.SECRET,
      signOptions: { expiresIn: "1d" },
    })
    try {
      const accessToken = this.jwtService.sign(payload)

      return accessToken
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async generateRefreshToken(_id: any): Promise<string> {
    this.jwtService = new JwtService({
      secret: process.env.SECRET,
      signOptions: { expiresIn: "30d" },
    })
    try {
      const hash = randomBytes(8)
      const refreshToken = this.jwtService.sign({
        code: hash.toString(),
        _id,
      })

      return refreshToken
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
