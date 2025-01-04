import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProtectedModule } from './protected/protected.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { EmailModule } from './email/email.module';

@Module({
  imports: [PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule, UsersModule, JwtModule, ProtectedModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService, 
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    }
  ],
  exports: [AuthService]
})
export class AppModule { }
