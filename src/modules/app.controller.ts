import { Controller, Get } from '@nestjs/common'

class AppControllerResponse {
  app: string
}

@Controller('/')
export class AppController {
  @Get('/')
  helloWold(): AppControllerResponse {
    return { app: 'guessthegame-backend' }
  }
}
