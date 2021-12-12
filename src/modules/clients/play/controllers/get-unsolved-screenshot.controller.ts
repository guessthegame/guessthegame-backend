import { randomInt } from 'crypto'

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { IsNumber } from 'class-validator'

import { RequestContainingUser } from '../../../auth/auth.types'
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'
import { PrismaService } from '../../../shared/prisma/prisma.service'

export class GetUnsolvedScreenshotControllerRequest {
  @IsNumber({}, { each: true })
  exclude!: number[]
}

class GetUnsolvedScreenshotControllerResponse {
  id!: number | null
}

@ApiTags('Frontend')
@Controller()
export class GetUnsolvedScreenshotController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/frontend/play/unsolved-screenshot-authenticated')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: GetUnsolvedScreenshotControllerResponse })
  async authenticated(
    @Req() req: RequestContainingUser,
    @Body() body: GetUnsolvedScreenshotControllerRequest
  ): Promise<GetUnsolvedScreenshotControllerResponse> {
    const id = await this.getUnsolvedScreenshotId(body.exclude, req.user.id)
    return { id }
  }

  @Post('/frontend/play/unsolved-screenshot-unauthenticated')
  @ApiResponse({ type: GetUnsolvedScreenshotControllerResponse })
  async unauthenticated(
    @Body() body: GetUnsolvedScreenshotControllerRequest
  ): Promise<GetUnsolvedScreenshotControllerResponse> {
    const id = await this.getUnsolvedScreenshotId(body.exclude)
    return { id }
  }

  private async getUnsolvedScreenshotId(
    exclude: number[],
    userId?: number
  ): Promise<number | null> {
    // Try to get an unseen unsolved screenshot
    const unsolvedUnseenScreenshotId = await this.getRandomUnseenScreenshot(exclude, userId)
    if (unsolvedUnseenScreenshotId) {
      return unsolvedUnseenScreenshotId
    }

    // Get unseen screenshot
    return this.getRandomUnsolvedScreenshot(exclude, userId)
  }

  private async getRandomUnseenScreenshot(exclude: number[], userId?: number) {
    const where = {
      NOT: { id: { in: exclude } },
      isValidated: true,
      ...(userId ? { solvedScreenshots: { none: { userId: userId } } } : {}),
    }
    const nbOfUnsolvedScreenshots = await this.prisma.screenshot.count({
      where,
    })
    if (nbOfUnsolvedScreenshots === 0) {
      return null
    }
    const skip = randomInt(0, nbOfUnsolvedScreenshots)
    return this.findFirstId({
      userId,
      where,
      skip,
    })
  }

  private async getRandomUnsolvedScreenshot(exclude: number[], userId?: number) {
    const nbOfUnsolvedScreenshots = await this.prisma.screenshot.count({
      where: {
        isValidated: true,
        ...(userId ? { solvedScreenshots: { none: { userId: userId } } } : {}),
      },
    })
    if (nbOfUnsolvedScreenshots === 0) {
      return null
    }

    if (nbOfUnsolvedScreenshots === 1) {
      return this.findFirstId({ userId })
    }

    if (nbOfUnsolvedScreenshots === 2) {
      return this.findFirstId({
        userId,
        where: {
          NOT: { id: exclude[0] },
        },
      })
    }

    const skip = randomInt(0, nbOfUnsolvedScreenshots)
    return this.findFirstId({
      userId,
      skip,
    })
  }

  private async findFirstId({
    userId,
    where,
    skip,
  }: {
    userId?: number
    where?: Prisma.ScreenshotWhereInput
    skip?: number
  }) {
    const screenshot = await this.prisma.screenshot.findFirst({
      where: {
        isValidated: true,
        ...(userId
          ? {
              solvedScreenshots: { none: { userId: userId } },
              addedByUserId: { not: userId },
            }
          : {}),
        ...where,
      },
      skip,
    })
    return screenshot?.id || null
  }
}
