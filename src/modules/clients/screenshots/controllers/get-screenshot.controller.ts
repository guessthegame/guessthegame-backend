import { Controller, Get, NotFoundException, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'
import { PrismaService } from '../../../shared/prisma/prisma.service'

class GetScreenshotControllerResponse {}

Controller()
export class GetScreenshotController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('/screenshots/:id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: GetScreenshotControllerResponse })
  async get(@Param('id', ParseIntPipe) id: number): Promise<GetScreenshotControllerResponse> {
    const screenshot = await this.prisma.screenshot.findUnique({
      where: { id },
      select: { image: { select: { uuid: true, transformations: true } } },
    })
    if (!screenshot) {
      throw new NotFoundException()
    }

    return screenshot
  }
}
