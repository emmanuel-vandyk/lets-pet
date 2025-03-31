import { NestFactory } from '@nestjs/core';
import { Controller, Get, Module } from '@nestjs/common';

@Controller('test')
class TestController {
  @Get()
  getStatus() {
    return {
      status: 'ok',
      message: 'API is running correctly',
      timestamp: new Date().toISOString(),
    };
  }
}

@Module({
  controllers: [TestController],
})
class TestModule {}

// Esta función se ejecutará cuando se acceda a este archivo directamente
async function bootstrap() {
  const app = await NestFactory.create(TestModule);

  // Esta ruta estará disponible en /test
  app.setGlobalPrefix('');

  // Solo en entorno de desarrollo
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(3333);
    console.log('Test server running on port 3333');
  } else {
    await app.init();
  }

  return app;
}

// Export for serverless use
export default bootstrap;

// Handler for Vercel
export const handler = async (req, res) => {
  const app = await bootstrap();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
};
