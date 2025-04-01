// Script para verificar la conexión a la base de datos desde Vercel
const { PrismaClient } = require('@prisma/client');

// Función para manejar la API
module.exports = async (req, res) => {
  console.log('Verifying database connection...');

  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'minimal',
  });

  try {
    console.log('Connecting to database...');
    console.log(`Database URL is configured: ${!!process.env.DATABASE_URL}`);

    await prisma.$connect();
    console.log('Database connection successful');

    // Intentar hacer una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log(`Query successful: ${JSON.stringify(result)}`);

    // Información de IP para diagnóstico
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress;

    return res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      connection: {
        success: true,
        timestamp: new Date().toISOString(),
      },
      environment: {
        node_env: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION,
      },
      request: {
        ip,
        method: req.method,
        path: req.url,
      },
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.error(error.stack);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to connect to database',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    await prisma.$disconnect();
  }
};
