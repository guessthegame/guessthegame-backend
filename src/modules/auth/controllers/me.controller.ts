import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { DatabaseService } from '../../shared/database/database.service'
import { RequestContainingUser } from '../auth.types'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

export class MeAuthControllerResponse {
  uuid!: string
  username!: string | null
  email!: string | null
}

@ApiTags('auth')
@Controller()
export class MeAuthController {
  constructor(private readonly prisma: DatabaseService) {}

  @Get('/auth/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: MeAuthControllerResponse })
  async me(@Req() req: RequestContainingUser): Promise<MeAuthControllerResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } })

    if (!user) {
      throw new NotFoundException()
    }

    return {
      uuid: user.uuid,
      username: user.username,
      email: user.email,
    }
  }
}
