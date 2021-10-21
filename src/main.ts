import { NestFactory } from '@nestjs/core'

import { AppModule } from './modules/app.module'

/**
 * Bootstrap the whole application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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
   * Start the application and make it listen on port defined in .env
   */
  if (!process.env.API_PORT) {
    throw new Error('Missing API_PORT env var')
  }
  await app.listen(process.env.API_PORT)
}
bootstrap()
