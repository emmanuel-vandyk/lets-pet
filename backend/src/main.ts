import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { CORS } from './constants';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // En entorno de producción, desactivamos morgan para evitar logs excesivos
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  app.enableCors(CORS);

  // Configuramos el prefijo global ANTES de configurar Swagger
  app.setGlobalPrefix('api', {
    exclude: ['/', 'docs'],
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

  // Solo en entorno de desarrollo, necesitamos escuchar en un puerto
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 8080;
    await app.listen(port);
    logger.log(`Server is running on port ${port}`);
    logger.log(`Swagger is running on http://localhost:${port}/api/docs`);
  }

  return app;
}

// Para entornos serverless, exportamos la aplicación
export default bootstrap();
