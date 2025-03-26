import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, UnauthorizedException, } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthErrors, AuthSuccess, AuthWarns } from './constants';
import { Tokens } from './types';
import { RequestResetPasswordDto } from 'src/email/dto/request-reset-password.dto';
import { ResetPasswordDto } from 'src/email/dto/reset-password.dto';
import { EmailService } from 'src/email/email.service';


@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
    private emailService: EmailService,
  ) { }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const accessTokenDuration = this.configService.get<number>('ACCESS_TOKEN_EXP');
    const refreshTokenDuration = this.configService.get<number>('REFRESH_TOKEN_EXP');

    const [at, rt] = await Promise.all([
      this.jwt.signAsync({
        id: userId,
        email,
      },
        {
          secret: this.configService.get<string>('SEC_TKN'),
          expiresIn: accessTokenDuration,
        }
      ),
      this.jwt.signAsync({
        id: userId,
        email,
      },
        {
          secret: this.configService.get<string>('SEC_REF_TKN'),
          expiresIn: refreshTokenDuration,
        }
      ),
    ]);

    return {
      access_token: at, refresh_token: rt
    }
  }

  private readonly logger = new Logger(AuthService.name);

  async signUp(dto: RegisterUserDto): Promise<Tokens> {
    this.validatePasswords(dto)
    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Data to lower case
    dto.email = dto.email.toLowerCase();

    try {
      // Create user
      const createdUser = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: hashedPassword,
          terms: dto.terms,
        },
      });
      this.logger.log(`User ${createdUser.email} created successfully`);

      const tokens = await this.getTokens(createdUser.id, createdUser.email);
      await this.updateRtHash(createdUser.id, tokens.refresh_token);

      return tokens;

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(AuthWarns.USER_EXISTS);
        }
      }
      throw new InternalServerErrorException('User creation failed');
    }
  }

  async signIn(@Body() dto: LoginUserDto): Promise<Tokens> {
    const { email, password } = dto;

    // Buscar usuario por email
    const user: User = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(AuthErrors.INVALID_CREDENTIALS);
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async signOut(userId: string): Promise<{ message: string }> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
    return { message: AuthSuccess.USER_SIGNED_OUT };
  }

  private validatePasswords(registerUserDto: RegisterUserDto): void {
    if (registerUserDto.password !== registerUserDto.passwordConfirmation) {
      throw new BadRequestException(AuthErrors.PASSWORD_MISMATCH)
    }
  }

  async refreshTokens(userId: string, rt: string) {
    const user: User = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException(AuthErrors.ACCESS_DENIED);

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException(AuthErrors.ACCESS_DENIED);

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;

  }

  async updateRtHash(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }


  async requestResetPassword(requestResetPasswordDto: RequestResetPasswordDto): Promise<void> {
    const { email } = requestResetPasswordDto;
    const user: User = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(AuthErrors.USER_NOT_FOUND + `${email} not found.`);
    }

    // Generar token de recuperación
    const resetToken = this.jwt.sign(
      { id: user.id, email },
      {
        secret: this.configService.get<string>('SEC_RESET_PASSWORD'),
        expiresIn: '1h',
      });

    // Enviar un correo electrónico con el enlace
    const resetLink = `${this.configService.get<string>(
      'FRONTEND_DEV_URL',
    )}/reset-password?token=${resetToken}`;

    try {
      await this.emailService.sendEmailNodemailer(email,
        'Recupera tu contraseña en Lets Pet',
        `Hola, ${user.firstName}:\n\nHemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:\n\n${resetLink}\n\nSi no solicitaste este cambio, ignora este mensaje.\n\nEl equipo de Let’s Pet. 🐾`
      );
    } catch (error) {
      this.logger.error(`Error al enviar el correo: ${error.message}`);
      throw new InternalServerErrorException('Error al enviar el correo de recuperación.');
    }

    this.logger.log(`Se envió un correo de recuperación a ${email}`)
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;
    try {
      const payload = this.jwt.verify(token, {
        secret: this.configService.get<string>('SEC_RESET_PASSWORD'),
      });

      const user: User = await this.prisma.user.findUnique({
        where: {
          id: payload.id
        },
      });

      if (!user) {
        throw new BadRequestException(AuthErrors.INVALID_OR_EXPIRED_TOKEN);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
          hashedRt: null,
        },
      });

    } catch (error) {
      throw new UnauthorizedException(AuthErrors.INVALID_OR_EXPIRED_TOKEN)
    }
  }
}
