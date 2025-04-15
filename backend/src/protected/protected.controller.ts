import { Get, Req, Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('protected')
@UseGuards(AuthGuard('jwt'))
export class ProtectedController {
  @Get()
  getProtectedData(@Req() req: Request) {
    const user = req.user;
    return { message: 'Access granted!', user };
  }
}
