import { Module } from '@nestjs/common'

import { PrismaModule } from '../../../shared/prisma/prisma.module'
import { UploadScreenshotController } from './controllers/upload-screenshot.controller'

@Module({
  imports: [PrismaModule],
  controllers: [UploadScreenshotController],
})
export class ScreenshotsFrontendModule {}
