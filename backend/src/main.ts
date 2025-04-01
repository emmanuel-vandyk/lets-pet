import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
/* import * as morgan from 'morgan'; */
import { CORS } from './constants';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('Main');

// Para entornos serverless, es útil guardar y reutilizar la instancia
let app: INestApplication;

async function bootstrap() {
  try {
    // Si ya tenemos una instancia de la aplicación, la reutilizamos
    if (app) {
      logger.log('Reusing existing application instance');
      return app;
    }

    logger.log('Creating new application instance');
    app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
      // Aumentar el timeout para las peticiones
      bodyParser: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        // Configuración adicional para manejar mejor los errores
        forbidUnknownValues: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
      }),
    );

    /*   // Desactivamos morgan en producción para evitar logs excesivos
    if (process.env.NODE_ENV !== 'production') {
      app.use(morgan('dev'));
    } */

    // Configuración de CORS
    app.enableCors(CORS);

    // Configuramos el prefijo global ANTES de configurar Swagger
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

    // Middleware para registro de peticiones
    app.use((req: Request, res: Response, next: NextFunction) => {
      logger.debug(`[${req.method}] ${req.url}`);
      next();
    });

    // Middleware para manejar errores globales
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error(`Error handling request: ${err.message}`);
      logger.error(err.stack);

      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
        });
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
      logger.log('Application initialized in serverless mode');
    }

    return app;
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    logger.error(error.stack);
    throw error;
  }
}

// Para entornos serverless, exportamos la aplicación inicializada
export default bootstrap;

// Exportamos un handler específico para Vercel
export const handler = async (req, res) => {
  try {
    logger.log(`Handling request: ${req.method} ${req.url}`);
    const server = await bootstrap();
    return server.getHttpAdapter().getInstance()(req, res);
  } catch (error) {
    logger.error(`Error in handler: ${error.message}`);
    logger.error(error.stack);

    // Asegurarse de que devolvemos una respuesta en caso de error
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error:
          process.env.NODE_ENV !== 'production' ? error.message : undefined,
      });
    }
  }
};
