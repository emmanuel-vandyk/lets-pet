import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      // En producción simplemente registramos que el servicio se ha iniciado
      // No intentamos conectar inmediatamente para evitar bloquear la inicialización
      this.logger.log(
        'Prisma service initialized in production mode - deferring connection',
      );
      return;
    }

    try {
      await this.connectWithRetry();
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      // Solo en desarrollo lanzamos el error para forzar una corrección inmediata
      throw error;
    }
  }

  async connectWithRetry() {
    this.connectionRetries = 0;

    while (this.connectionRetries < this.MAX_RETRIES) {
      try {
        this.logger.log(
          `Connecting to database (attempt ${this.connectionRetries + 1}/${this.MAX_RETRIES})...`,
        );

        // Registrar información adicional para diagnóstico
        this.logger.debug(`Database URL format: ${!!process.env.DATABASE_URL}`);
        this.logger.debug(`Direct URL format: ${!!process.env.DIRECT_URL}`);

        await this.$connect();
        this.isConnected = true;
        this.logger.log('Successfully connected to database');

        // Hacer una consulta simple para verificar que la conexión realmente funciona
        const result = await this.$queryRaw`SELECT 1 as connected`;
        this.logger.log(
          `Database connection verified: ${JSON.stringify(result)}`,
        );

        return this;
      } catch (error) {
        this.connectionRetries++;
        this.isConnected = false;

        const errorMessage = error.message || 'Unknown database error';
        this.logger.error(
          `Database connection attempt ${this.connectionRetries} failed: ${errorMessage}`,
        );

        if (errorMessage.includes('Address not in tenant allow_list')) {
          this.logger.error(
            `IP access error: Vercel's IP address is not allowed to access Supabase. You may need to configure Supabase to allow all connections.`,
          );
        }

        if (this.connectionRetries < this.MAX_RETRIES) {
          const delay = this.RETRY_DELAY_MS * this.connectionRetries;
          this.logger.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          this.logger.error(
            `Failed to connect to database after ${this.MAX_RETRIES} attempts`,
          );
          throw error;
        }
      }
    }
  }

  // Método público para verificar la conexión a la base de datos
  async checkConnection() {
    try {
      if (!this.isConnected) {
        await this.connectWithRetry();
      }

      // Realizar una consulta simple para verificar la conexión
      await this.$queryRaw`SELECT 1 as connected`;
      return { connected: true, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async onModuleDestroy() {
    try {
      if (this.isConnected) {
        this.logger.log('Disconnecting from database...');
        await this.$disconnect();
        this.isConnected = false;
        this.logger.log('Successfully disconnected from database');
      }
    } catch (error) {
      this.logger.error(`Error disconnecting from database: ${error.message}`);
    }
  }
}
