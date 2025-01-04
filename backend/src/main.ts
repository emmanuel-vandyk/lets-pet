import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { env } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(morgan('dev'));

  app.enableCors(CORS);

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
