import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.use(morgan('dev'));

  app.enableCors(CORS);

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
