import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators';
import { PrismaService } from './prisma/prisma.service';

// Función para forzar logs visibles en Vercel
function forceLog(message: string, obj?: any) {
  // Log directo a la consola (aparecerá en Vercel)
  if (obj) {
    console.log(`[VERCEL-DB-CHECK] ${message}`, JSON.stringify(obj));
  } else {
    console.log(`[VERCEL-DB-CHECK] ${message}`);
  }
}

@ApiTags('App')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

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
    forceLog('Welcome endpoint called');
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
    forceLog('Health check endpoint called');

    // Obtener el estado de la conexión a la base de datos
    const dbStatus = await this.prismaService.checkConnection();
    forceLog('Database check result:', dbStatus);

    // Información sobre el entorno
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION,
    };
    forceLog('Environment info:', environment);

    // Información sobre la memoria
    const memoryUsage = process.memoryUsage();
    const memory = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    };
    forceLog('Memory usage:', memory);

    const response = {
      status: 'online',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment,
      memory,
    };

    forceLog('Sending health response:', response);
    return response;
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
    forceLog('=== INICIANDO DIAGNÓSTICO DE BASE DE DATOS ===');
    forceLog(`Timestamp: ${new Date().toISOString()}`);

    try {
      // Mostrar todas las variables de entorno (sin credenciales)
      forceLog('Variables de entorno disponibles:');
      const envVars = Object.keys(process.env)
        .filter(
          (key) =>
            !key.includes('KEY') &&
            !key.includes('SECRET') &&
            !key.includes('TOKEN') &&
            !key.includes('PASSWORD'),
        )
        .reduce((obj, key) => {
          obj[key] = process.env[key] ? 'CONFIGURADO' : 'NO CONFIGURADO';
          return obj;
        }, {});
      forceLog('Environment variables:', envVars);

      // Extraer información sobre la URL de la base de datos (sin mostrar credenciales)
      const dbUrlParts = process.env.DATABASE_URL?.split('@') || [];
      let dbHost = 'unknown';
      let dbProtocol = 'unknown';

      if (process.env.DATABASE_URL) {
        if (dbUrlParts.length > 1) {
          dbHost = dbUrlParts[1].split('/')[0];
        }

        const protocolParts = process.env.DATABASE_URL.split('://');
        if (protocolParts.length > 1) {
          dbProtocol = protocolParts[0];
        }

        forceLog(`Database host: ${dbHost}`);
        forceLog(`Database protocol: ${dbProtocol}`);
      } else {
        forceLog('DATABASE_URL no está configurada');
      }

      forceLog(`DIRECT_URL configurada: ${!!process.env.DIRECT_URL}`);

      // Intentar conectar a la base de datos
      forceLog('Intentando conectar a la base de datos...');
      const connectionResult = await this.prismaService.checkConnection();
      forceLog('Resultado de la conexión:', connectionResult);

      // Información adicional sobre la base de datos
      let dbInfo = null;
      try {
        if (connectionResult.connected) {
          forceLog('Conexión exitosa, obteniendo información adicional...');
          // Obtener versión de PostgreSQL
          const versionResult = await this.prismaService
            .$queryRaw`SELECT version()`;
          dbInfo = {
            version: versionResult[0].version,
            isSupabase: dbHost.includes('supabase'),
          };
          forceLog('Información de la base de datos:', dbInfo);
        } else {
          forceLog('No se pudo conectar a la base de datos');
        }
      } catch (error) {
        forceLog(`Error obteniendo información de DB: ${error.message}`);
        dbInfo = { error: error.message };
      }

      const responseTime = Date.now() - startTime;
      forceLog(`Tiempo de respuesta: ${responseTime}ms`);

      const response = {
        status: connectionResult.connected ? 'success' : 'error',
        message: connectionResult.connected
          ? 'Database connection successful'
          : `Database connection failed: ${connectionResult.error || 'Unknown error'}`,
        connectionDetails: {
          ...connectionResult,
          responseTimeMs: responseTime,
          host: dbHost,
          protocol: dbProtocol,
          dbInfo,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          vercelEnv: process.env.VERCEL_ENV || 'unknown',
          vercelRegion: process.env.VERCEL_REGION || 'unknown',
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

      forceLog('=== DIAGNÓSTICO COMPLETO ===');
      forceLog('Enviando respuesta:', response);

      return response;
    } catch (error) {
      forceLog(`Error inesperado: ${error.message}`);
      forceLog(`Stack trace: ${error.stack}`);

      const response = {
        status: 'error',
        message: `Unexpected error during database diagnostics: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString(),
        responseTimeMs: Date.now() - startTime,
        environment: {
          nodeEnv: process.env.NODE_ENV || 'development',
          vercelEnv: process.env.VERCEL_ENV || 'unknown',
          vercelRegion: process.env.VERCEL_REGION || 'unknown',
        },
      };

      forceLog('Enviando respuesta de error:', response);
      return response;
    }
  }
}
