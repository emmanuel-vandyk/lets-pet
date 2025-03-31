import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators';

@Controller()
export class AppController {
  @Public()
  @Get()
  getWelcome() {
    return {
      name: "Let's Pet API",
      version: '1.0.0',
      status: 'online',
      description: "API para la aplicación Let's Pet",
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        // Añade otros endpoints principales aquí
      },
      timestamp: new Date().toISOString(),
    };
  }
}
