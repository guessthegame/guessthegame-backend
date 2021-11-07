import { randomBytes } from 'crypto'

import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'

import { PrismaService } from '../shared/prisma/prisma.service'
import { AccessTokenContentType, AuthTokensType } from './auth.types'

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  /**
   * Hash password using bcrypt
   * https://github.com/dcodeIO/bcrypt.js#usage---async
   */
  async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10)
    return hash
  }

  /**
   * Check that a password provided by a user matches a hashed password
   */
  checkPassword(password: string, passwordHash: string): void {
    // We check that the given password matches the user's password
    if (!bcrypt.compareSync(password, passwordHash)) {
      throw new UnauthorizedException()
    }
  }

  /**
   * Return auth tokens (access + refresh tokens) generated from user's session data
   */
  async generateTokens(user: { id: number; uuid: string }): Promise<AuthTokensType> {
    const payload: AccessTokenContentType = {
      id: user.id,
      uuid: user.uuid,
    }

    const accessToken = this.jwtService.sign(payload)

    const refreshToken = await this.generateRefreshTokenForUser(user.id)

    return {
      accessToken,
      refreshToken,
    }
  }

  /**
   * Generate and insert in database a refreshToken
   * The refresh token is used by a client to obtain an access token
   * The refresh token is valid 30 days
   */
  private async generateRefreshTokenForUser(userId: number): Promise<string> {
    // Generate a random string about 500 characters long.
    const refreshToken = randomBytes(500).toString('base64')

    // Refresh token will be valid for 30 days
    const creationDate = new Date()
    const expirationDate = new Date(creationDate.getTime() + 30 * 24 * 3600 * 1000)

    // Insert Refresh Token in database
    await this.prisma.userRefreshToken.create({
      data: {
        userId: userId,
        creationDate: creationDate,
        expirationDate: expirationDate,
        token: refreshToken,
      },
    })

    return refreshToken
  }
}
