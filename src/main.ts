import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './modules/app.module'
import { DatabaseService } from './modules/shared/database/database.service'
import { bootstrapSwagger } from './services/swagger'

/**
 * Bootstrap the whole application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  /**
   * https://docs.nestjs.com/recipes/prisma#issues-with-enableshutdownhooks
   */
  const prismaService: DatabaseService = app.get(DatabaseService)
  prismaService.enableShutdownHooks(app)

  /**
   * Set global prefix api version
   */
  if (process.env.API_VERSION) {
    app.setGlobalPrefix(process.env.API_VERSION)
  }

  /**
   * https://docs.nestjs.com/security/cors
   */
  if (process.env.CORS_CLIENTS) {
    app.enableCors({
      origin: process.env.CORS_CLIENTS.split(','),
    })
  }

  /**
   * Enables auto validation for rules for all incoming client payloads,
   * where the specific rules are declared with simple annotations in local DTO declarations
   * https://docs.nestjs.com/techniques/validation
   */
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true, transform: true }))

  /**
   * Start Swagger Documentation server
   * available at http://localhost:3100/swagger/
   */
  bootstrapSwagger(app)

  /**
   * Start the application and make it listen on port defined in .env
   */
  if (!process.env.API_PORT) {
    throw new Error('Missing API_PORT env var')
  }
  await app.listen(process.env.API_PORT)
}
bootstrap()
