import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle("Let's Pet API")
    .setDescription("API para la aplicación Let's Pet")
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.use(morgan('dev'));

  app.use('/api/docs', (req: Request, res: Response, next: NextFunction) => {
    req['isPublic'] = true;
    next();
  });

  app.enableCors(CORS);

  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.log(`Server is running on port ${port}`);
  logger.log(`Swagger is running on http://localhost:${port}/api`);
}
bootstrap();
