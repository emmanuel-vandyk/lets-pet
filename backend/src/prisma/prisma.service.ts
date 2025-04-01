import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  constructor() {
    // Opciones para un mejor rendimiento en entornos serverless
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? ['error']
          : ['query', 'error', 'warn'],
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      throw error;
    }
  }

  async connect() {
    if (!this.isConnected) {
      try {
        this.logger.log('Connecting to database...');
        await this.$connect();
        this.isConnected = true;
        this.logger.log('Successfully connected to database');
      } catch (error) {
        this.isConnected = false;
        this.logger.error(`Database connection error: ${error.message}`);

        // Si estamos en producción, intentar una vez más después de un breve retraso
        if (process.env.NODE_ENV === 'production') {
          this.logger.log('Retrying connection in 2 seconds...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await this.$connect();
          this.isConnected = true;
          this.logger.log('Successfully connected to database on retry');
        } else {
          throw error;
        }
      }
    }
    return this;
  }

  async onModuleDestroy() {
    try {
      this.logger.log('Disconnecting from database...');
      await this.$disconnect();
      this.isConnected = false;
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error(`Error disconnecting from database: ${error.message}`);
    }
  }
}
