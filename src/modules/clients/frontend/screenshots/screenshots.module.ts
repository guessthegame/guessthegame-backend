import { Module } from '@nestjs/common'

import { DatabaseModule } from '../../../shared/database/database.module'
import { UploadScreenshotController } from './controllers/upload-screenshot.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [UploadScreenshotController],
})
export class ScreenshotsFrontendModule {}
