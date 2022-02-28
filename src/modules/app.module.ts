import { join } from 'path'

import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'

import { TrimMiddleware } from '../middlewares/trim.middleware'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { ClientsModule } from './clients/clients.module'
import { DatabaseModule } from './shared/database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    ClientsModule,
    DatabaseModule,
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
