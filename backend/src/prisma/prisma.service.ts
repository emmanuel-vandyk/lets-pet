import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Función para forzar logs visibles en Vercel
function forceLog(message: string, obj?: any) {
  // Log directo a la consola (aparecerá en Vercel)
  if (obj) {
    console.log(`[VERCEL-PRISMA] ${message}`, JSON.stringify(obj));
  } else {
    console.log(`[VERCEL-PRISMA] ${message}`);
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private connectionRetries = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor() {
    // Opciones optimizadas para entornos serverless
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? ['error']
          : ['query', 'error', 'warn'],
      errorFormat: 'minimal',
      // Configuración de conexión optimizada para entorno serverless
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Log inicial para verificar que el servicio se está creando correctamente
    forceLog('PrismaService constructor called');
    forceLog(`DATABASE_URL configurada: ${!!process.env.DATABASE_URL}`);
    forceLog(`DIRECT_URL configurada: ${!!process.env.DIRECT_URL}`);
  }

  async onModuleInit() {
    forceLog('PrismaService onModuleInit called');

    if (process.env.NODE_ENV === 'production') {
      // En producción simplemente registramos que el servicio se ha iniciado
      // No intentamos conectar inmediatamente para evitar bloquear la inicialización
      forceLog(
        'Prisma service initialized in production mode - deferring connection',
      );
      return;
    }

    try {
      await this.connectWithRetry();
    } catch (error) {
      forceLog(`Failed to connect to database: ${error.message}`);
      forceLog(`Stack trace: ${error.stack}`);
      // Solo en desarrollo lanzamos el error para forzar una corrección inmediata
      throw error;
    }
  }

  async connectWithRetry() {
    forceLog('Starting connectWithRetry method');
    this.connectionRetries = 0;

    while (this.connectionRetries < this.MAX_RETRIES) {
      try {
        forceLog(
          `Connecting to database (attempt ${this.connectionRetries + 1}/${this.MAX_RETRIES})...`,
        );

        // Registrar información adicional para diagnóstico
        forceLog(`Database URL format: ${!!process.env.DATABASE_URL}`);
        forceLog(`Direct URL format: ${!!process.env.DIRECT_URL}`);

        // Si tenemos la URL de la base de datos, registrar el host (sin credenciales)
        if (process.env.DATABASE_URL) {
          const dbUrlParts = process.env.DATABASE_URL?.split('@') || [];
          let dbHost = 'unknown';
          if (dbUrlParts.length > 1) {
            dbHost = dbUrlParts[1].split('/')[0];
            forceLog(`Database host: ${dbHost}`);
          }
        }

        await this.$connect();
        this.isConnected = true;
        forceLog('Successfully connected to database');

        // Hacer una consulta simple para verificar que la conexión realmente funciona
        const result = await this.$queryRaw`SELECT 1 as connected`;
        forceLog(`Database connection verified:`, result);

        return this;
      } catch (error) {
        this.connectionRetries++;
        this.isConnected = false;

        const errorMessage = error.message || 'Unknown database error';
        forceLog(
          `Database connection attempt ${this.connectionRetries} failed: ${errorMessage}`,
        );
        forceLog(`Error details: ${error.code || 'No error code'}`);

        if (errorMessage.includes('Address not in tenant allow_list')) {
          forceLog(
            `IP access error: Vercel's IP address is not allowed to access Supabase. You may need to configure Supabase to allow all connections.`,
          );
          forceLog(
            'Sugerencia: Configura 0.0.0.0/0 en la configuración de red de Supabase para permitir todas las conexiones.',
          );
        }

        if (this.connectionRetries < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY_MS * this.connectionRetries;
          forceLog(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          forceLog(
            `Failed to connect to database after ${this.MAX_RETRIES} attempts`,
          );
          throw error;
        }
      }
    }
  }

  // Método público para verificar la conexión a la base de datos
  async checkConnection() {
    forceLog('Checking database connection...');
    try {
      if (!this.isConnected) {
        forceLog('Not connected, attempting to connect...');
        await this.connectWithRetry();
      }

      // Realizar una consulta simple para verificar la conexión
      forceLog('Executing test query...');
      await this.$queryRaw`SELECT 1 as connected`;

      forceLog('Connection check successful');
      return { connected: true, timestamp: new Date().toISOString() };
    } catch (error) {
      forceLog(`Connection check failed: ${error.message}`);

      return {
        connected: false,
        error: error.message,
        errorCode: error.code || 'No error code',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async onModuleDestroy() {
    try {
      if (this.isConnected) {
        forceLog('Disconnecting from database...');
        await this.$disconnect();
        this.isConnected = false;
        forceLog('Successfully disconnected from database');
      }
    } catch (error) {
      forceLog(`Error disconnecting from database: ${error.message}`);
    }
  }
}
