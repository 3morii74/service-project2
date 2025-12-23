import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(data: { email: string; password: string; name: string }) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(data: { email: string; password: string }) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'validate' })
  async validate(data: { token: string }) {
    return this.authService.validateToken(data.token);
  }
}

