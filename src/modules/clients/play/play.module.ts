import { Module } from '@nestjs/common'

import { PrismaModule } from '../../shared/prisma/prisma.module'
import { GetUnsolvedScreenshotController } from './controllers/get-unsolved-screenshot.controller'

@Module({
  imports: [PrismaModule],
  controllers: [GetUnsolvedScreenshotController],
})
export class PlayFrontendModule {}
