import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { TrimMiddleware } from '../middlewares/trim.middleware'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { FrontendModule } from './clients/frontend.module'
import { PrismaModule } from './shared/prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    AuthModule,
    FrontendModule,
    PrismaModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  /**
   * Middlewares
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TrimMiddleware).forRoutes('*')
  }
}
