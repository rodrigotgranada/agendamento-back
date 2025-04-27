import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'ok',
      message: 'Servidor está funcionando',
      timestamp: new Date().toISOString(),
    };
  }
}
