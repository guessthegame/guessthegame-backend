import { Body, Controller, Put, UnauthorizedException } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

import { DatabaseService } from '../../shared/database/database.service'
import { AuthService } from '../auth.service'

export class RefreshTokenAuthControllerRequest {
  /**
   * Refresh Token, obtained after a login
   * @example aBc123azdDa56
   */
  @IsNotEmpty()
  refreshToken!: string
}

export class RefreshTokenAuthControllerResponse {
  accessToken!: string
  refreshToken!: string
}

@ApiTags('auth')
@Controller()
export class RefreshTokenAuthController {
  constructor(private readonly prisma: DatabaseService, private authService: AuthService) {}

  @Put('/auth/tokens')
  @ApiResponse({ type: RefreshTokenAuthControllerResponse })
  async refresh(
    @Body() body: RefreshTokenAuthControllerRequest
  ): Promise<RefreshTokenAuthControllerResponse> {
    // Check that the refresh token is valid
    const refreshToken = await this.prisma.userRefreshToken.findUnique({
      where: { token: body.refreshToken },
      select: {
        expirationDate: true,
        user: {
          select: {
            id: true,
            uuid: true,
          },
        },
      },
    })
    if (!refreshToken || new Date() > refreshToken.expirationDate) {
      throw new UnauthorizedException()
    }

    // Generate a new pair of access/refresh tokens
    const tokens = this.authService.generateTokens({
      id: refreshToken.user.id,
      uuid: refreshToken.user.uuid,
    })

    // Refresh tokens can be used only once: we delete the refresh token now that it has been used
    await this.prisma.userRefreshToken.delete({
      where: { token: body.refreshToken },
    })

    // Return pair of tokens to the client
    return tokens
  }
}
