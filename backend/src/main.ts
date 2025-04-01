import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CORS } from './constants';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('Main');

// Para entornos serverless, es útil guardar y reutilizar la instancia
let app;

async function bootstrap() {
  try {
    // Si ya tenemos una instancia de la aplicación, la reutilizamos
    if (app) {
      logger.log('Reusing existing application instance');
      return app;
    }

    logger.log('Creating new application instance');
    // Añadir timeout más largo para evitar problemas de conexión
    app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
      // Aumentar el timeout para evitar problemas de conexión
      bodyParser: true,
      abortOnError: false,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    // Configurar CORS para permitir solicitudes desde cualquier origen en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
      });
    } else {
      app.enableCors(CORS);
    }

    // Configuramos el prefijo global
    app.setGlobalPrefix('api', {
      exclude: ['/', 'docs'],
    });

    // Configuración de Swagger
    const config = new DocumentBuilder()
      .setTitle("Let's Pet API")
      .setDescription("API para la aplicación Let's Pet Services")
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    // Usamos una ruta más específica para la documentación
    SwaggerModule.setup('api/docs', app, document);

    // Middleware para marcar la ruta de Swagger como pública
    app.use('/api/docs', (req: Request, res: Response, next: NextFunction) => {
      req['isPublic'] = true;
      next();
    });

    // Middleware para manejar errores
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error(`Error handling request: ${error.message}`);
      logger.error(error.stack);

      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
          error:
            process.env.NODE_ENV !== 'production' ? error.message : undefined,
        });
      } else {
        next(error);
      }
    });

    // Solo en entorno de desarrollo, necesitamos escuchar en un puerto
    if (process.env.NODE_ENV !== 'production') {
      const port = process.env.PORT || 8080;
      await app.listen(port);
      logger.log(`Server is running on port ${port}`);
      logger.log(`Swagger is running on http://localhost:${port}/api/docs`);
    } else {
      await app.init();
      logger.log('Application initialized in serverless environment');
    }

    return app;
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    logger.error(error.stack);

    // En producción, intentamos continuar a pesar de los errores
    if (process.env.NODE_ENV === 'production' && app) {
      logger.warn('Continuing despite initialization error');
      return app;
    }

    throw error;
  }
}

// Para entornos serverless, exportamos la aplicación
export default bootstrap;

// Handler específico para Vercel con mejor manejo de timeout
export const handler = async (req, res) => {
  try {
    // Establecer un timeout para evitar que las funciones se queden bloqueadas
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Handler timeout after 25 seconds'));
      }, 25000); // 25 segundos es suficiente para la mayoría de las operaciones
    });

    // Race entre la ejecución normal y el timeout
    await Promise.race([
      (async () => {
        const server = await bootstrap();
        const expressInstance = server.getHttpAdapter().getInstance();
        return expressInstance(req, res);
      })(),
      timeoutPromise,
    ]);
  } catch (error) {
    logger.error(`Handler error: ${error.message}`);
    logger.error(error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message:
          process.env.NODE_ENV !== 'production'
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  }
};
