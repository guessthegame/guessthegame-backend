import { Module } from '@nestjs/common'

import { FrontendModule } from './frontend/frontend.module'

@Module({
  imports: [FrontendModule],
})
export class ClientsModule {}
