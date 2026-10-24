import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserServiceService } from './user-service.service';
import { USER_PATTERNS } from '@app/shared';

@Controller()
export class UserServiceController {
  constructor(private readonly userService: UserServiceService) {}

  @MessagePattern(USER_PATTERNS.GET_PROFILE)
  async getProfile(@Payload() data: { userId: string }) {
    return this.userService.getProfile(data.userId);
  }

  @MessagePattern(USER_PATTERNS.UPDATE_PROFILE)
  async updateProfile(@Payload() payload: { userId: string; data: any }) {
    return this.userService.updateProfile(payload.userId, payload.data);
  }

  @MessagePattern(USER_PATTERNS.GET_ALL_PROFILES)
  async getAllProfiles() {
    return this.userService.getAllProfiles();
  }

  @MessagePattern(USER_PATTERNS.GET_FREELANCER_PROFILES)
  async getFreelancerProfiles(@Payload() payload: { 
    cursor?: string;
    search?: string;
    category?: string;
    rateMin?: number;
    rateMax?: number;
    skills?: string;
  }) {
    return this.userService.getFreelancerProfiles(
      payload.cursor,
      payload.search,
      payload.category,
      payload.rateMin,
      payload.rateMax,
      payload.skills
    );
  }

  @MessagePattern(USER_PATTERNS.UPDATE_KYC_STATUS)
  async updateKycStatus(@Payload() payload: { userId: string; status: any }) {
    return this.userService.updateKycStatus(payload.userId, payload.status);
  }
}
