import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

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
        health: '/api/health',
        // Añade otros endpoints principales aquí
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health information',
    type: Object,
  })
  async getHealth() {
    // Obtener el estado de la conexión a la base de datos
    const dbStatus = await this.prismaService.checkConnection();

    // Información sobre el entorno
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION,
    };

    // Información sobre la memoria
    const memoryUsage = process.memoryUsage();
    const memory = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    };

    return {
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment,
      memory,
    };
  }
}
