import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { LocalConfigService } from './config.service'

@Module({
  providers: [ConfigService, LocalConfigService],
  exports: [LocalConfigService],
})
export class LocalConfigModule {}
