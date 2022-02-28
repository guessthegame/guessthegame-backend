import { Module } from '@nestjs/common'

import { DatabaseModule } from '../../../shared/database/database.module'
import { GetScreenshotController } from './controllers/get-screenshot.controller'
import { GetUnsolvedScreenshotController } from './controllers/get-unsolved-screenshot.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [GetUnsolvedScreenshotController, GetScreenshotController],
})
export class PlayFrontendModule {}
