import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { CORS } from './constants';
import { INestApplication } from '@nestjs/common';

// Para entornos serverless, es útil guardar y reutilizar la instancia
let app: INestApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.use(morgan('dev'));
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors(CORS);

    app.setGlobalPrefix('api');
  }

  await app.listen(process.env.PORT ?? 8080);
  return app;
}
bootstrap();
