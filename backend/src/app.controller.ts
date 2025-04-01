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
        dbcheck: '/api/db-check',
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

  @Public()
  @Get('db-check')
  @ApiOperation({ summary: 'Detailed database connection diagnostics' })
  @ApiResponse({
    status: 200,
    description: 'Database connection diagnostics',
    type: Object,
  })
  async getDatabaseDiagnostics() {
    const startTime = Date.now();
    console.log('[DB-CHECK] Starting database diagnostics');

    try {
      // Extraer información sobre la URL de la base de datos (sin mostrar credenciales)
      const dbUrlParts = process.env.DATABASE_URL?.split('@') || [];
      let dbHost = 'unknown';
      if (dbUrlParts.length > 1) {
        dbHost = dbUrlParts[1].split('/')[0];
      }

      console.log(`[DB-CHECK] Database host: ${dbHost}`);
      console.log(
        `[DB-CHECK] Database URL is configured: ${!!process.env.DATABASE_URL}`,
      );
      console.log(
        `[DB-CHECK] Direct URL is configured: ${!!process.env.DIRECT_URL}`,
      );

      // Intentar conectar a la base de datos
      const connectionResult = await this.prismaService.checkConnection();
      console.log(
        `[DB-CHECK] Connection result: ${JSON.stringify(connectionResult)}`,
      );

      // Información adicional sobre la base de datos
      let dbInfo = null;
      try {
        if (connectionResult.connected) {
          // Obtener versión de PostgreSQL
          const versionResult = await this.prismaService
            .$queryRaw`SELECT version()`;
          dbInfo = {
            version: versionResult[0].version,
            isSupabase: dbHost.includes('supabase'),
          };
          console.log(`[DB-CHECK] Database info: ${JSON.stringify(dbInfo)}`);
        }
      } catch (error) {
        console.error(`[DB-CHECK] Error getting DB info: ${error.message}`);
        dbInfo = { error: error.message };
      }

      const responseTime = Date.now() - startTime;

      return {
        status: connectionResult.connected ? 'success' : 'error',
        message: connectionResult.connected
          ? 'Database connection successful'
          : `Database connection failed: ${connectionResult.error || 'Unknown error'}`,
        connectionDetails: {
          ...connectionResult,
          responseTimeMs: responseTime,
          host: dbHost,
          dbInfo,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          vercelRegion: process.env.VERCEL_REGION,
        },
        request: {
          timestamp: new Date().toISOString(),
          path: '/api/db-check',
        },
        tips: connectionResult.connected
          ? []
          : [
              'Si estás usando Supabase, verifica que has permitido el acceso desde la IP de Vercel (0.0.0.0/0 para permitir todas)',
              'Revisa que la URL de conexión a la base de datos sea correcta en las variables de entorno',
              'Si el problema persiste, considera usar el URL de conexión directa de Supabase o un pooler',
            ],
      };
    } catch (error) {
      console.error(`[DB-CHECK] Unexpected error: ${error.message}`);

      return {
        status: 'error',
        message: `Unexpected error during database diagnostics: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          vercelRegion: process.env.VERCEL_REGION,
        },
      };
    }
  }
}
