import { Module } from '@nestjs/common'

import { PlayFrontendModule } from './play/play.module'
import { ScreenshotsFrontendModule } from './screenshots/screenshots.module'

@Module({
  imports: [PlayFrontendModule, ScreenshotsFrontendModule],
})
export class FrontendModule {}
