import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Para entornos serverless, es útil guardar y reutilizar la instancia
let app;

async function bootstrap() {
  try {
    // Log directo para Vercel
    console.log('[VERCEL] Iniciando aplicación');
    console.log(`[VERCEL] Entorno: ${process.env.NODE_ENV}`);
    console.log(
      `[VERCEL] DATABASE_URL configurado: ${!!process.env.DATABASE_URL}`,
    );

    // Si ya tenemos una instancia de la aplicación, la reutilizamos
    if (app) {
      console.log('[VERCEL] Reutilizando instancia existente');
      return app;
    }

    console.log('[VERCEL] Creando nueva instancia');

    // Crear aplicación NestJS
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    // Configurar CORS
    app.enableCors({
      origin: ['http://localhost:3000', 'https://lets-pet.vercel.app'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Configurar prefijo global
    app.setGlobalPrefix('api', {
      exclude: ['/', 'health', 'docs'],
    });

    // Configuración de Swagger
    const config = new DocumentBuilder()
      .setTitle("Let's Pet API")
      .setDescription("API para la aplicación Let's Pet")
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Middleware para capturar errores
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(`[VERCEL-ERROR] ${error.message}`);
      console.error(`[VERCEL-ERROR] ${error.stack}`);

      if (!res.headersSent) {
        res.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
        });
      } else {
        next(error);
      }
    });

    // Solo en desarrollo necesitamos escuchar en un puerto
    if (process.env.NODE_ENV !== 'production') {
      const port = process.env.PORT || 8080;
      await app.listen(port);
      console.log(`[VERCEL] Server running on port ${port}`);
    } else {
      await app.init();
      console.log('[VERCEL] Application initialized in serverless mode');
    }

    return app;
  } catch (error) {
    console.error(`[VERCEL-ERROR] Failed to start: ${error.message}`);
    console.error(`[VERCEL-ERROR] ${error.stack}`);

    // En producción, continuamos aunque haya un error
    if (process.env.NODE_ENV === 'production') {
      console.warn('[VERCEL-ERROR] Running in degraded mode');

      // Si no tenemos app, crear una mínima con Express
      if (!app) {
        const express = require('express');
        const expressApp = express();

        expressApp.use((req, res, next) => {
          console.log(`[VERCEL] Request: ${req.method} ${req.url}`);
          next();
        });

        expressApp.all('*', (req, res) => {
          res.status(500).json({
            error: 'Application failed to initialize properly',
            timestamp: new Date().toISOString(),
          });
        });

        return { getHttpAdapter: () => ({ getInstance: () => expressApp }) };
      }

      return app;
    }

    // En desarrollo, queremos que falle para arreglarlo
    throw error;
  }
}

// Handler para Vercel Functions
module.exports = async (req, res) => {
  console.log(`[VERCEL] Handler invocado: ${req.method} ${req.url}`);

  try {
    const server = await bootstrap();
    const expressInstance = server.getHttpAdapter().getInstance();
    return expressInstance(req, res);
  } catch (error) {
    console.error(`[VERCEL-ERROR] Handler error: ${error.message}`);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        timestamp: new Date().toISOString(),
      });
    }
  }
};
