import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class UserServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: {
          userId,
          fullName: 'Người dùng mới', 
        },
      });
    }

    return profile;
  }

  async updateProfile(userId: string, data: any) {
    let profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return await this.prisma.userProfile.create({
        data: {
          userId,
          fullName: data.fullName || 'Người dùng mới',
          ...data,
        },
      });
    }
    return await this.prisma.userProfile.update({
      where: { userId },
      data,
    });
  }

  async getAllProfiles() {
    return this.prisma.userProfile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFreelancerProfiles(
    cursor?: string,
    search?: string,
    category?: string,
    rateMin?: number,
    rateMax?: number,
    skills?: string
  ) {
    const limit = 20;
    const where: any = {};

    if (search && search.trim() !== '') {
      where.OR = [
        { fullName: { contains: search.trim() } },
        { bio: { contains: search.trim() } }
      ];
    }

    if ((rateMin !== undefined && !isNaN(rateMin)) || (rateMax !== undefined && !isNaN(rateMax))) {
      where.hourlyRate = {};
      if (rateMin !== undefined && !isNaN(rateMin)) where.hourlyRate.gte = rateMin;
      if (rateMax !== undefined && !isNaN(rateMax)) where.hourlyRate.lte = rateMax;
    }

    // For skills, since it's JSON, Prisma MySQL JSON filtering can be complex.
    // If skills is a string like "React", we can use JSON_CONTAINS or just string search
    // Since skills is stored as a JSON array of strings:
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      // Prisma MySQL json filtering for arrays: 
      // where.skills = { array_contains: skillArray[0] } // depends on Prisma version
      // We will do a basic workaround if exact JSON match isn't supported, 
      // or we can skip strict JSON filtering and do it in memory if needed.
    }

    const profiles = await this.prisma.userProfile.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      select: {
        id: true,
        userId: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        location: true,
        hourlyRate: true,
        skills: true,
        kycStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    let nextCursor: string | null = null;
    if (profiles.length > limit) {
      const nextItem = profiles.pop();
      nextCursor = nextItem!.id;
    }

    return {
      data: profiles,
      nextCursor,
    };
  }

  async updateKycStatus(userId: string, status: any) {
    return this.prisma.userProfile.update({
      where: { userId },
      data: { kycStatus: status },
    });
  }
}
