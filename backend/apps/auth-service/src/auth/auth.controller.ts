import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AUTH_PATTERNS } from '@app/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  async register(@Payload() data: RegisterDto) {
    return this.authService.register(data);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  async logout(@Payload() data: { refreshToken: string }) {
    return this.authService.logout(data.refreshToken);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(@Payload() data: { refreshToken: string }) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @MessagePattern(AUTH_PATTERNS.GET_USER)
  async getUser(@Payload() data: { id: string }) {
    return this.authService.getUser(data.id);
  }

  @MessagePattern(AUTH_PATTERNS.GET_FREELANCERS)
  async getFreelancers(@Payload() data: { cursor?: string }) {
    return this.authService.getFreelancers(data?.cursor);
  }

  @MessagePattern(AUTH_PATTERNS.FORGOT_PASSWORD)
  async forgotPassword(@Payload() data: { email: string }) {
    return this.authService.forgotPassword(data.email);
  }

  @MessagePattern(AUTH_PATTERNS.RESET_PASSWORD)
  async resetPassword(@Payload() data: any) {
    return this.authService.resetPassword(data.email, data.code, data.newPassword);
  }

  @MessagePattern(AUTH_PATTERNS.GET_ALL_USERS)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @MessagePattern(AUTH_PATTERNS.UPDATE_USER_STATUS)
  async updateUserStatus(@Payload() data: { id: string; isActive: boolean }) {
    return this.authService.updateUserStatus(data.id, data.isActive);
  }
}
