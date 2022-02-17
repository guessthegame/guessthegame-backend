import { randomInt } from 'crypto'

import { BadRequestException, Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { IsNumber } from 'class-validator'

import { RequestContainingUser } from '../../../../auth/auth.types'
import { JwtAuthGuard } from '../../../../auth/guards/jwt-auth.guard'
import { PrismaService } from '../../../../shared/prisma/prisma.service'

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
    // Security against long queries
    if (exclude.length > 500) {
      throw new BadRequestException('EXCLUDE_LIST_TOO_BIG')
    }

    // Try to get an unseen unsolved screenshot
    const unsolvedUnseenScreenshotId = await this.getRandomUnseenScreenshot(exclude, userId)
    if (unsolvedUnseenScreenshotId) {
      return unsolvedUnseenScreenshotId
    }

    // The user has seen all screenshots: return a random unsolved one
    return this.getRandomUnsolvedScreenshot(exclude, userId)
  }

  /**
   * Return a random screenshot not part of the exclude parameter.
   */
  private async getRandomUnseenScreenshot(exclude: number[], userId?: number) {
    // Where clause: common + exclude
    const where = {
      ...this.commonWhere(userId),
      NOT: { id: { in: exclude } },
    }
    // If no screenshot found, return null
    const nbOfUnsolvedScreenshots = await this.prisma.screenshot.count({ where })
    if (nbOfUnsolvedScreenshots === 0) {
      return null
    }
    // If some screenshots are found, return a random one
    const skip = randomInt(0, nbOfUnsolvedScreenshots)
    return this.findFirstId({
      where,
      skip,
    })
  }

  /**
   * Return a random screenshot from all unsolved screenshot.
   * If the user has only 1 screenshot left, return it.
   */
  private async getRandomUnsolvedScreenshot(exclude: number[], userId?: number) {
    const lastOnePlayerSaw: number | undefined = exclude[exclude.length - 1]

    // Count how many screenshots left the user has to solve minus the last one they saw
    const where = {
      ...this.commonWhere(userId),
      NOT: { id: lastOnePlayerSaw },
    }
    const nbOfUnsolvedScreenshots = await this.prisma.screenshot.count({ where })

    // No screenshot found: only lastOnePlayerSaw remains
    if (nbOfUnsolvedScreenshots === 0) {
      if (typeof lastOnePlayerSaw === 'number') {
        return this.findFirstId({ where: { id: lastOnePlayerSaw } })
      } else {
        return null
      }
    }

    // Return a random screenshot from the where
    const skip = randomInt(0, nbOfUnsolvedScreenshots)
    return this.findFirstId({
      where,
      skip,
    })
  }

  /**
   * Return the id of the screenshot selected by where + skip.
   * NOTE: the commonWhere shall already be included in the `where` property.
   */
  private async findFirstId({
    where,
    skip,
  }: {
    where?: Prisma.ScreenshotWhereInput
    skip?: number
  }) {
    const screenshot = await this.prisma.screenshot.findFirst({
      where,
      skip,
    })
    return screenshot?.id || null
  }

  /**
   * Where clause common to all queries.
   */
  private commonWhere(userId?: number): Prisma.ScreenshotWhereInput {
    return {
      isValidated: true,
      ...(userId
        ? {
            solvedScreenshots: { none: { userId: userId } },
            addedByUserId: { not: userId },
          }
        : {}),
    }
  }
}
