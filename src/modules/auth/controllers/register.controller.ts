import { BadRequestException, Body, Controller, NotFoundException, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { IsNotEmpty, IsOptional } from 'class-validator'

import { PrismaService } from '../../shared/prisma/prisma.service'
import { AuthService } from '../auth.service'
import { RefreshTokenAuthControllerResponse } from './refresh-token.controller'

export class RegisterAuthControllerRequest {
  @IsNotEmpty()
  username!: string

  @IsNotEmpty()
  password!: string

  @IsOptional()
  browserToken?: string

  @IsOptional()
  email?: string
}

export class RegisterAuthControllerResponse {
  accessToken!: string
  refreshToken!: string
}

@ApiTags('auth')
@Controller()
export class RegisterAuthController {
  constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

  @Post('/auth/register')
  @ApiResponse({ type: RefreshTokenAuthControllerResponse })
  async register(
    @Body() body: RegisterAuthControllerRequest
  ): Promise<RegisterAuthControllerResponse> {
    /**
     * Get existing user id from browserToken
     */
    const userId = await this.getUserFromBrowserToken(body)

    /**
     * Check that username is not taken
     */
    const existingUser = await this.prisma.user.findUnique({
      where: { username: body.username },
      select: { id: true },
    })
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('USERNAME_TAKEN')
    }

    /**
     * Register the user
     */
    const user = await this.registerUser(userId, body)

    /**
     * Return tokens
     */
    return this.authService.generateTokens(user)
  }

  /**
   * Return the user id of the user retrieved via the browserToken
   */
  private async getUserFromBrowserToken(
    body: RegisterAuthControllerRequest
  ): Promise<number | null> {
    if (!body.browserToken) {
      return null
    }
    const user = await this.prisma.user.findUnique({
      where: { browserToken: body.browserToken },
      select: { id: true, username: true },
    })
    if (!user) {
      throw new NotFoundException('BROWSER_TOKEN_MATCHES_NO_USER')
    }
    return user.id
  }

  /**
   * If user already exists, updates it
   * If user does not exist, creates it
   */
  private async registerUser(
    userId: number | null,
    body: RegisterAuthControllerRequest
  ): Promise<Pick<User, 'id' | 'uuid'>> {
    // User data
    const passwordHash = await this.authService.hashPassword(body.password)
    const userData = {
      username: body.username,
      email: body.email,
      passwordHash,
    }

    // If user already exists, updates it
    if (userId) {
      return this.prisma.user.update({
        where: { id: userId },
        data: userData,
        select: { id: true, uuid: true },
      })
    }

    // If user does not exist, creates it
    return this.prisma.user.create({
      data: userData,
      select: { id: true, uuid: true },
    })
  }
}
