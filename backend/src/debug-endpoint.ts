import { NestFactory } from '@nestjs/core';
import { Controller, Get, Module, Logger, Query, Param } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

const logger = new Logger('DebugEndpoint');
let prisma: PrismaClient;

function getPrismaInstance() {
  if (!prisma) {
    logger.log('Creating new PrismaClient instance');
    prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  return prisma;
}

@Controller('debug')
class DebugController {
  @Get()
  getInfo() {
    return {
      message: 'Debug endpoint running',
      timestamp: new Date().toISOString(),
      availableTests: [
        '/debug/db - Test database connection',
        '/debug/env - Get environment info',
        '/debug/memory - Get memory usage',
        '/debug/error - Trigger sample error',
      ],
    };
  }

  @Get('db')
  async testDatabase() {
    try {
      const client = getPrismaInstance();
      logger.log('Testing database connection...');

      await client.$connect();
      logger.log('Database connection successful');

      // Intenta obtener un conteo de usuarios (operación simple)
      const userCount = await client.user.count();

      return {
        status: 'success',
        message: 'Database connection successful',
        userCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Database test error: ${error.message}`);
      logger.error(error.stack);

      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    } finally {
      try {
        // No desconectamos para mantener la conexión pool
        // await prisma.$disconnect();
      } catch (e) {
        logger.error(`Error disconnecting: ${e.message}`);
      }
    }
  }

  @Get('env')
  getEnvironment() {
    return {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('memory')
  getMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('error')
  triggerError() {
    try {
      throw new Error('Test error triggered');
    } catch (error) {
      logger.error('Test error caught:', error.stack);
      return {
        status: 'error caught',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [DebugController],
})
class DebugModule {}

async function bootstrap() {
  try {
    logger.log('Bootstrapping debug module...');
    const app = await NestFactory.create(DebugModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    // No usamos prefijo global para facilitar el acceso

    // Solo en entorno de desarrollo
    if (process.env.NODE_ENV !== 'production') {
      await app.listen(3334);
      logger.log('Debug server running on port 3334');
    } else {
      await app.init();
      logger.log('Debug application initialized in serverless mode');
    }

    return app;
  } catch (error) {
    logger.error(`Debug bootstrap error: ${error.message}`);
    logger.error(error.stack);
    throw error;
  }
}

// Export for serverless use
export default bootstrap;

// Handler for Vercel
export const handler = async (req, res) => {
  try {
    logger.log(`Handling debug request: ${req.method} ${req.url}`);
    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    logger.error(`Error in debug handler: ${error.message}`);
    logger.error(error.stack);

    res.status(500).json({
      status: 'error',
      message: 'Internal server error in debug endpoint',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
