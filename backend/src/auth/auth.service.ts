import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }
  async registerUser(dto: RegisterUserDto): Promise<any> {
    console.log('registerUser llamado con los siguientes datos:', dto);
    

    if (dto.password !== dto.passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      console.log("Creando usuario...");
      const newUser = await this.prisma.user.create({
        
        data: {
          name: dto.name,
          lastname: dto.lastname,
          email: dto.email,
          password: hashedPassword,
          terms: dto.terms,
        },
      });
      console.log("Usuario creado exitosamente:", newUser);
    } catch (error) {
      if (error.code = 'P2002') {
        console.log("Error creando usuario:", error);
        throw new BadRequestException('Error creando usuario');
      }
      throw new InternalServerErrorException('Error creating user')
    }
  }

}
