import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Handler } from 'aws-lambda';
import { CORS } from './constants';

let app: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  if (app) {
    return app;
  }

  app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors(CORS);

  // Configuramos el prefijo global
  app.setGlobalPrefix('api', {
    exclude: ['/', 'docs'],
  });

  await app.init();
  return app;
}

export const handler: Handler = async (event, context) => {
  // Hacer que el contexto se mantenga vivo
  context.callbackWaitsForEmptyEventLoop = false;

  const nestApp = await bootstrap();
  const httpAdapter = nestApp.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  // Convertir evento de AWS Lambda a req/res de Express
  const { httpMethod, path, headers, body, queryStringParameters } = event;

  return new Promise((resolve, reject) => {
    const req = {
      method: httpMethod,
      url: path,
      headers,
      body: body ? JSON.parse(body) : {},
      query: queryStringParameters || {},
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: (name, value) => {
        res.headers[name] = value;
      },
      getHeader: (name) => res.headers[name],
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      send: (data) => {
        if (typeof data === 'object') {
          res.headers['Content-Type'] = 'application/json';
          res.body = JSON.stringify(data);
        } else {
          res.body = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body,
        });
      },
      json: (data) => {
        res.headers['Content-Type'] = 'application/json';
        res.body = JSON.stringify(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body,
        });
      },
      end: () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body,
        });
      },
    };

    instance(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        // Si no hubo respuesta, enviar una por defecto
        resolve({
          statusCode: 404,
          body: JSON.stringify({ message: 'Not Found' }),
          headers: { 'Content-Type': 'application/json' },
        });
      }
    });
  });
};
