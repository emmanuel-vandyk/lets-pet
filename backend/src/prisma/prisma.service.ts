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
    try {
      await this.connectWithRetry();
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      if (process.env.NODE_ENV === 'production') {
        // En producción, no queremos que el servicio falle por completo
        this.logger.warn('Continuing despite database connection failure');
      } else {
        throw error;
      }
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
            `IP access error: Vercel's IP address is not allowed to access Supabase. Please add the Vercel IP addresses to the allow list in Supabase dashboard.`,
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
