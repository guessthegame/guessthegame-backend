import { INestApplication, Injectable } from '@nestjs/common'

import { PrismaClient } from '.prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
  /**
   * https://docs.nestjs.com/recipes/prisma#use-prisma-client-in-your-nestjs-services
   */
  enableShutdownHooks(app: INestApplication): void {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }
}
