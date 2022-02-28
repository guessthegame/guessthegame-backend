import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { RequestContainingUser, UserSessionType } from '../../../../auth/auth.types'
import { JwtAuthGuard } from '../../../../auth/guards/jwt-auth.guard'
import { DatabaseService } from '../../../../shared/database/database.service'

class GetScreenshotControllerResponse {
  creationDate!: Date
  addedBy!: GetScreenshotControllerResponse_User
  firstSolvedBy!: GetScreenshotControllerResponse_User | null
  totalSolves!: number
  image!: GetScreenshotControllerResponse_Image
}
class GetScreenshotControllerResponse_User {
  username!: string
}
class GetScreenshotControllerResponse_Image {
  transformedUuid!: string
  transformations!: GetScreenshotControllerResponse_Transformations
}
class GetScreenshotControllerResponse_Transformations {
  top!: number
  bottom!: number
  left!: number
  right!: number
  angle!: number
  flipY!: boolean
  invert!: boolean
}

@ApiTags('frontend')
@Controller()
export class GetScreenshotController {
  constructor(private readonly prisma: DatabaseService) {}

  @Get('/frontend/play/get-screenshot/:id/unauthenticated')
  @ApiResponse({ type: GetScreenshotControllerResponse })
  getUnauthenticated(@Param('id', ParseIntPipe) id: number) {
    return this.getScreenshot(id)
  }

  @Get('/frontend/play/get-screenshot/:id/authenticated')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: GetScreenshotControllerResponse })
  getAuthenticated(@Param('id', ParseIntPipe) id: number, @Req() req: RequestContainingUser) {
    return this.getScreenshot(id, req.user)
  }

  private async getScreenshot(
    id: number,
    user?: UserSessionType
  ): Promise<GetScreenshotControllerResponse> {
    // Get Screenshot
    const screenshot = await this.prisma.screenshot.findUnique({
      where: { id },
      select: {
        isValidated: true,
        creationDate: true,
        addedBy: {
          select: { id: true, username: true },
        },
        solvedScreenshots: {
          select: { user: { select: { username: true } } },
          where: { user: { isRegistered: true } },
          orderBy: { id: 'asc' },
          take: 1,
        },
        image: { select: { transformedUuid: true, transformations: true } },
      },
    })
    if (!screenshot) {
      throw new NotFoundException()
    }

    // If the screenshot has not been published yet, only the user who added it can see it
    if (!screenshot.isValidated && screenshot.addedBy.id !== user?.id) {
      throw new ForbiddenException('SCREENSHOT_NOT_VALIDATED')
    }

    // Retrieve count of how many registered users have solved the screenshot
    const totalSolves = await this.prisma.solvedScreenshot.count({
      where: { screenshotId: id, user: { isRegistered: true } },
    })

    // If the screenshot was first solved by
    const firstSolvedBy = screenshot.solvedScreenshots[0]?.user

    return {
      ...screenshot,
      firstSolvedBy,
      totalSolves,
      image: {
        ...screenshot.image,
        transformations: screenshot.image
          .transformations as unknown as GetScreenshotControllerResponse_Transformations,
      },
    }
  }
}
