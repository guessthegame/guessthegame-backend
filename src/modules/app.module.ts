import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { ScreenshotsModule } from './screenshots/screenshots.module'
import { PrismaModule } from './shared/prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    AuthModule,
    ScreenshotsModule,
    PrismaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
