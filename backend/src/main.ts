import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Para entornos serverless, es útil guardar y reutilizar la instancia
let app;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(morgan('dev'));

  app.enableCors(CORS);

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
