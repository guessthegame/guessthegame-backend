import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { PrismaService } from '../../shared/prisma/prisma.service'
import { AuthService } from '../auth.service'
import { AuthTokensType } from '../auth.types'

export class CreateTokenAuthControllerRequest {
  /**
   * User username
   * @example polo
   */
  @IsOptional()
  username?: string

  /**
   * User password
   * @example password
   */
  @IsOptional()
  password?: string

  /**
   * Browser Token (if user has not registered yet)
   */
  @IsOptional()
  browserToken?: string
}

export class CreateTokenAuthControllerResponse {
  accessToken!: string
  refreshToken!: string
}

@ApiTags('auth')
@Controller()
export class CreateTokenAuthController {
  constructor(private readonly authService: AuthService, private readonly prisma: PrismaService) {}

  @Post('/auth/tokens')
  @ApiResponse({
    type: CreateTokenAuthControllerResponse,
  })
  async login(@Body() body: CreateTokenAuthControllerRequest): Promise<AuthTokensType> {
    /**
     * Retrieve user from either (username|email)/password or from browserToken
     */
    const user = await this.getUser(body)

    /**
     * If user does not exist: Unauthorized
     */
    if (!user) {
      throw new UnauthorizedException()
    }

    /**
     * Return access & refresh tokens
     */
    return this.authService.generateTokens(user)
  }

  /**
   * Retrieve user from either username/password or from browserToken
   */
  private getUser(body: CreateTokenAuthControllerRequest) {
    // Retrieve user from username / password
    if (body.username) {
      if (!body.password) {
        throw new UnauthorizedException()
      }
      return this.getUserFromUsernamePassword(body.username, body.password)
    }

    // Retrieve user from browserToken
    if (body.browserToken) {
      return this.getUserFromBrowserToken(body.browserToken)
    }

    // No username, no browserToken: cannot log in
    throw new UnauthorizedException()
  }

  /**
   * Retrieve user using username/password or email/password
   */
  private async getUserFromUsernamePassword(username: string, password: string) {
    // Try to find user by username
    let user = await this.prisma.user.findUnique({
      where: { username: username },
      select: { id: true, uuid: true, roles: true, passwordHash: true },
    })

    // If unsuccessful, try to find user by email
    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { email: username },
        select: { id: true, uuid: true, roles: true, passwordHash: true },
      })
    }

    // If could not find user or if user has no password: Unauthorized
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException()
    }

    // Check password
    this.authService.checkPassword(password, user.passwordHash)

    // All good: return user
    return user
  }

  /**
   * Retrieve user using browserToken
   */
  private async getUserFromBrowserToken(browserToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { browserToken },
      select: { id: true, uuid: true, roles: true, passwordHash: true },
    })

    return user
  }
}
