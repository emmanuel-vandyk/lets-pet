import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Handler } from 'aws-lambda';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();

  await app.init();

  // Para Vercel, necesitamos usar un enfoque más simple
  // No usamos serverlessExpress aquí
  return async (event, context) => {
    // Aquí manejamos directamente la solicitud
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'API is running' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  };
}

export const handler: Handler = async (event, context) => {
  server = server ?? (await bootstrap());
  return server(event, context);
};
