import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    return firstValueFrom(
      this.authService.send({ cmd: 'register' }, registerDto)
    );
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    return firstValueFrom(
      this.authService.send({ cmd: 'login' }, loginDto)
    );
  }

  @Post('validate')
  async validate(@Body() validateDto: any) {
    return firstValueFrom(
      this.authService.send({ cmd: 'validate' }, validateDto)
    );
  }
}

