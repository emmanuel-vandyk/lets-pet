import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication, Logger } from '@nestjs/common';
import { Handler } from 'aws-lambda';
import { CORS } from './constants';

const logger = new Logger('Lambda');
let app: INestApplication;

async function bootstrap(): Promise<INestApplication> {
  try {
    if (app) {
      logger.log('Reusing existing app instance');
      return app;
    }

    logger.log('Creating new app instance');
    app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
      abortOnError: false,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
      }),
    );

    app.enableCors(CORS);

    // Configuramos el prefijo global
    app.setGlobalPrefix('api', {
      exclude: ['/', 'docs'],
    });

    // Middleware para registro de peticiones
    app.use((req, res, next) => {
      logger.debug(`[${req.method}] ${req.url}`);
      next();
    });

    await app.init();
    logger.log('Application initialized successfully');
    return app;
  } catch (error) {
    logger.error(`Bootstrap error: ${error.message}`);
    logger.error(error.stack);
    throw error;
  }
}

export const handler: Handler = async (event, context) => {
  try {
    // Para evitar que la función espere a que se vacíe el bucle de eventos
    context.callbackWaitsForEmptyEventLoop = false;
    logger.log(`Handling request: ${event.httpMethod} ${event.path}`);

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
          logger.log(`Response sent: ${res.statusCode}`);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.body,
          });
        },
        json: (data) => {
          res.headers['Content-Type'] = 'application/json';
          res.body = JSON.stringify(data);
          logger.log(`JSON response sent: ${res.statusCode}`);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.body,
          });
        },
        end: () => {
          logger.log(`Request ended: ${res.statusCode}`);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.body,
          });
        },
      };

      try {
        instance(req, res, (err) => {
          if (err) {
            logger.error(`Express middleware error: ${err.message}`);
            logger.error(err.stack);
            reject(err);
          } else {
            // Si no hubo respuesta, enviar una por defecto
            logger.warn('No response was sent, sending default 404');
            resolve({
              statusCode: 404,
              body: JSON.stringify({ message: 'Not Found' }),
              headers: { 'Content-Type': 'application/json' },
            });
          }
        });
      } catch (error) {
        logger.error(`Unexpected error: ${error.message}`);
        logger.error(error.stack);
        resolve({
          statusCode: 500,
          body: JSON.stringify({
            message: 'Internal Server Error',
            error:
              process.env.NODE_ENV !== 'production' ? error.message : undefined,
          }),
          headers: { 'Content-Type': 'application/json' },
        });
      }
    });
  } catch (error) {
    logger.error(`Handler error: ${error.message}`);
    logger.error(error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error:
          process.env.NODE_ENV !== 'production' ? error.message : undefined,
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
