import { HttpService } from '@nestjs/axios'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing'

import { AppModule } from '../../src/modules/app.module'

/**
 * https://docs.nestjs.com/fundamentals/testing#end-to-end-testing
 */
export async function createTestApp(mockedHttpModule?: unknown): Promise<INestApplication> {
  const moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })

  if (mockedHttpModule) {
    moduleBuilder.overrideProvider(HttpService).useValue(mockedHttpModule)
  }

  const module: TestingModule = await moduleBuilder.compile()

  const app = module.createNestApplication()
  app.useGlobalPipes(new ValidationPipe({ forbidUnknownValues: true, transform: true }))

  await app.init()

  return app
}
