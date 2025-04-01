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

    // Ocultar credenciales pero mostrar el host
    const dbUrlParts = process.env.DATABASE_URL?.split('@') || [];
    let dbHost = 'unknown';
    if (dbUrlParts.length > 1) {
      dbHost = dbUrlParts[1].split('/')[0];
    }

    await prisma.$connect();
    console.log('Database connection successful');

    // Intentar hacer una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log(`Query successful: ${JSON.stringify(result)}`);

    // Obtener la versión de PostgreSQL
    const version = await prisma.$queryRaw`SELECT version()`;

    // Información de IP para diagnóstico
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress;

    // Comprobaciones de Supabase
    const isSupabase = dbHost.includes('supabase');

    return res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      connection: {
        success: true,
        timestamp: new Date().toISOString(),
        host: dbHost,
        isSupabase,
        dbVersion: version[0].version,
      },
      environment: {
        node_env: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION,
        vercel_env: process.env.VERCEL_ENV,
      },
      request: {
        ip,
        method: req.method,
        path: req.url,
        headers: req.headers,
      },
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.error(error.stack);

    // Ocultar credenciales pero mostrar el host
    const dbUrlParts = process.env.DATABASE_URL?.split('@') || [];
    let dbHost = 'unknown';
    if (dbUrlParts.length > 1) {
      dbHost = dbUrlParts[1].split('/')[0];
    }

    return res.status(500).json({
      status: 'error',
      message: 'Failed to connect to database',
      error: error.message,
      host: dbHost,
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION,
        vercel_env: process.env.VERCEL_ENV,
      },
      request: {
        ip:
          req.headers['x-forwarded-for'] ||
          req.headers['x-real-ip'] ||
          req.connection.remoteAddress,
        method: req.method,
        path: req.url,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
};
