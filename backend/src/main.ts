import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CORS } from './constants';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Logging mejorado para Vercel
const logger = new Logger('Main');

// Función para imprimir un mensaje que seguro aparece en los logs de Vercel
function forceLog(message: string, obj?: any) {
  // Log normal de NestJS
  logger.log(message);

  // Log directo a la consola (aparecerá en Vercel)
  if (obj) {
    console.log(`[VERCEL-LOG] ${message}`, JSON.stringify(obj));
  } else {
    console.log(`[VERCEL-LOG] ${message}`);
  }
}

// Para entornos serverless, es útil guardar y reutilizar la instancia
let app;

async function bootstrap() {
  try {
    // Forzar logs visibles al inicio
    forceLog('=== APLICACIÓN INICIANDO ===');
    forceLog(`Entorno: ${process.env.NODE_ENV}`);
    forceLog(`Database URL configurada: ${!!process.env.DATABASE_URL}`);

    // Si ya tenemos una instancia de la aplicación, la reutilizamos
    if (app) {
      forceLog('Reutilizando instancia existente de la aplicación');
      return app;
    }

    forceLog('Creando nueva instancia de la aplicación');

    // Añadir timeout más largo para evitar problemas de conexión
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      // En producción, no falla si hay problemas con otros servicios
      abortOnError: process.env.NODE_ENV !== 'production',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    // Configurar CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Configuramos el prefijo global
    app.setGlobalPrefix('api', {
      exclude: ['/', 'docs', 'health'],
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

    // Middleware para capturar errores y garantizar que los logs se muestren
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      forceLog(`Error handling request: ${error.message}`);
      forceLog(`Stack trace: ${error.stack}`);

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
      forceLog(`Server is running on port ${port}`);
      forceLog(`Swagger is running on http://localhost:${port}/api/docs`);
    } else {
      await app.init();
      forceLog('Application initialized in serverless environment');
    }

    return app;
  } catch (error) {
    forceLog(`Failed to start application: ${error.message}`);
    forceLog(`Stack trace: ${error.stack}`);

    // En producción, tenemos que continuar incluso con errores
    // porque Vercel espera que el handler exporte una aplicación
    if (process.env.NODE_ENV === 'production') {
      forceLog('CRITICAL WARNING: Application running in degraded mode');

      // Vercel necesita alguna respuesta, así que creamos una mini app de Express
      if (!app) {
        const express = require('express');
        const expressApp = express();

        // Middleware para loggear todas las solicitudes
        expressApp.use((req, res, next) => {
          forceLog(`Request received: ${req.method} ${req.url}`);
          next();
        });

        // Respuesta básica para todas las rutas
        expressApp.all('*', (req, res) => {
          forceLog(`Responding with error for: ${req.method} ${req.url}`);
          res.status(500).json({
            error: 'Application failed to initialize properly',
            message:
              'The server is currently unavailable. Please try again later.',
            timestamp: new Date().toISOString(),
          });
        });

        return { getHttpAdapter: () => ({ getInstance: () => expressApp }) };
      }

      return app;
    }

    // En desarrollo, queremos que falle para poder arreglarlo
    throw error;
  }
}

// Para entornos serverless (Vercel), exportamos el handler
module.exports = async (req, res) => {
  try {
    forceLog(`Vercel handler invoked: ${req.method} ${req.url}`);

    const server = await bootstrap();
    const expressInstance = server.getHttpAdapter().getInstance();

    // Importante: este return devuelve una promesa que Vercel esperará
    return expressInstance(req, res);
  } catch (error) {
    forceLog(`Handler error: ${error.message}`);
    forceLog(`Stack trace: ${error.stack}`);

    // Si todo falla, al menos devolvemos una respuesta al cliente
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message:
          'The server encountered an unexpected condition that prevented it from fulfilling the request.',
        timestamp: new Date().toISOString(),
      });
    }
  }
};
