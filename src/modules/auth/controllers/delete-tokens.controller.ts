import { Body, Controller, Delete, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

import { DatabaseService } from '../../shared/database/database.service'
import { RequestContainingUser } from '../auth.types'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

export class DeleteTokensAuthRequest {
  @IsNotEmpty()
  refreshToken!: string
}

class DeleteTokensAuthControllerResponse {
  success!: boolean
}

@ApiTags('auth')
@Controller()
export class DeleteTokensAuthController {
  constructor(private prisma: DatabaseService) {}

  @Delete('/auth/tokens')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: DeleteTokensAuthControllerResponse })
  async logout(
    @Body() body: DeleteTokensAuthRequest,
    @Req() req: RequestContainingUser
  ): Promise<DeleteTokensAuthControllerResponse> {
    /**
     * Delete given refresh token of logged user
     */
    const { count } = await this.prisma.userRefreshToken.deleteMany({
      where: { userId: req.user.id, token: body.refreshToken },
    })

    return { success: count > 0 }
  }
}
