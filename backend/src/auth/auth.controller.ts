import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  registerUser(@Body() createUserDto: RegisterUserDto) {
    console.log(createUserDto);
    return this.authService.registerUser(createUserDto);
  }

  @Get('log-in')
  logIn() {
    return 'log-in';
  }

}
