import { NestFactory } from '@nestjs/core';
import {
  Controller,
  Get,
  Module,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

const logger = new Logger('TestEndpoint');
const prisma = new PrismaClient();

@Controller('test')
class TestController {
  @Get()
  async getStatus() {
    try {
      return {
        status: 'ok',
        message: 'API is running correctly',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
      };
    } catch (error) {
      logger.error(`Error in getStatus: ${error.message}`);
      throw new InternalServerErrorException('Error getting status');
    }
  }

  @Get('db')
  async testDatabase() {
    try {
      // Intenta conectarse y hacer una consulta simple
      await prisma.$connect();
      logger.log('Database connection successful');

      // Puedes intentar ejecutar una consulta simple aquí

      return {
        status: 'ok',
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Database connection error: ${error.message}`);
      logger.error(error.stack);

      return {
        status: 'error',
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    } finally {
      try {
        await prisma.$disconnect();
      } catch (e) {
        logger.error(`Error disconnecting from database: ${e.message}`);
      }
    }
  }

  @Get('env')
  async getEnvironmentInfo() {
    // No mostrar información sensible
    return {
      nodeEnv: process.env.NODE_ENV || 'not set',
      timestamp: new Date().toISOString(),
      databaseConfigured: !!process.env.DATABASE_URL,
      serverInfo: {
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      },
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [TestController],
})
class TestModule {}

// Esta función se ejecutará cuando se acceda a este archivo directamente
async function bootstrap() {
  try {
    logger.log('Bootstrapping test module...');
    const app = await NestFactory.create(TestModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    // Esta ruta estará disponible en /test
    app.setGlobalPrefix('');

    // Middleware para registro de peticiones
    app.use((req, res, next) => {
      logger.debug(`[${req.method}] ${req.url}`);
      next();
    });

    // Solo en entorno de desarrollo
    if (process.env.NODE_ENV !== 'production') {
      await app.listen(3333);
      logger.log('Test server running on port 3333');
    } else {
      await app.init();
      logger.log('Test application initialized in serverless mode');
    }

    return app;
  } catch (error) {
    logger.error(`Bootstrap error: ${error.message}`);
    logger.error(error.stack);
    throw error;
  }
}

// Export for serverless use
export default bootstrap;

// Handler for Vercel
export const handler = async (req, res) => {
  try {
    logger.log(`Handling test request: ${req.method} ${req.url}`);
    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    logger.error(`Error in test handler: ${error.message}`);
    logger.error(error.stack);

    res.status(500).json({
      status: 'error',
      message: 'Internal server error in test endpoint',
      error: process.env.NODE_ENV === 'production' ? null : error.message,
    });
  }
};
