import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators';

@ApiTags('App')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Welcome message',
    type: Object,
  })
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
