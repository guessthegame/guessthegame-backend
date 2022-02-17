import { Module } from '@nestjs/common'

import { PrismaModule } from '../../../shared/prisma/prisma.module'
import { GetScreenshotController } from './controllers/get-screenshot.controller'
import { GetUnsolvedScreenshotController } from './controllers/get-unsolved-screenshot.controller'

@Module({
  imports: [PrismaModule],
  controllers: [GetUnsolvedScreenshotController, GetScreenshotController],
})
export class PlayFrontendModule {}
