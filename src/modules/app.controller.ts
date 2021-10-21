import { Controller, Get } from '@nestjs/common'

import { version } from '../../package.json'

class AppControllerResponse {
  app: string
  version: string
}

@Controller()
export class AppController {
  @Get('/')
  helloWold(): AppControllerResponse {
    return { app: 'guessthegame-backend', version }
  }
}
