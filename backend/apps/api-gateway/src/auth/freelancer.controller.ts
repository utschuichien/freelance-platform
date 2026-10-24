import { Controller, Get, Inject, Query, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_PATTERNS, USER_PATTERNS, CONTRACT_PATTERNS } from '@app/shared';
import { firstValueFrom } from 'rxjs';

@Controller('api/freelancers')
export class FreelancerController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @Inject('CONTRACT_SERVICE') private contractClient: ClientProxy,
  ) {}

  @Get()
  async getFreelancers(
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('rateMin') rateMin?: number,
    @Query('rateMax') rateMax?: number,
    @Query('skills') skills?: string,
  ) {
    const cleanSearch = search && search.trim() !== '' ? search.trim() : undefined;
    const cleanCategory = category && category.trim() !== '' ? category.trim() : undefined;
    const cleanSkills = skills && skills.trim() !== '' ? skills.trim() : undefined;
    const cleanRateMin = rateMin !== undefined && !isNaN(Number(rateMin)) ? Number(rateMin) : undefined;
    const cleanRateMax = rateMax !== undefined && !isNaN(Number(rateMax)) ? Number(rateMax) : undefined;

    const result = await firstValueFrom(
      this.userClient.send(USER_PATTERNS.GET_FREELANCER_PROFILES, { 
        cursor, 
        search: cleanSearch, 
        category: cleanCategory, 
        rateMin: cleanRateMin, 
        rateMax: cleanRateMax, 
        skills: cleanSkills 
      })
    );

    if (result && Array.isArray(result.data)) {
      result.data = await Promise.all(
        result.data.map(async (profile: any) => {
          try {
            const reviewsData = await firstValueFrom(
              this.contractClient.send(CONTRACT_PATTERNS.GET_USER_REVIEWS, { userId: profile.userId })
            );
            return {
              ...profile,
              rating: reviewsData?.avgRating ?? 5.0,
              totalReviews: reviewsData?.total ?? 0,
            };
          } catch {
            return {
              ...profile,
              rating: 5.0,
              totalReviews: 0,
            };
          }
        })
      );
    }

    return result;
  }

  @Get(':id')
  async getFreelancer(@Param('id') id: string) {
    let user: any = null;
    try {
      user = await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.GET_USER, { id })
      );
    } catch (e) {}

    let profile: any = null;
    try {
      profile = await firstValueFrom(
        this.userClient.send(USER_PATTERNS.GET_PROFILE, { userId: id })
      );
    } catch (e) {}

    let reviewsData: any = { reviews: [], total: 0, avgRating: 5.0 };
    try {
      reviewsData = await firstValueFrom(
        this.contractClient.send(CONTRACT_PATTERNS.GET_USER_REVIEWS, { userId: id })
      );
    } catch (e) {}

    let enrichedReviews: any[] = [];
    if (reviewsData && Array.isArray(reviewsData.reviews)) {
      enrichedReviews = await Promise.all(
        reviewsData.reviews.map(async (r: any) => {
          let reviewerName = 'Khách hàng';
          try {
            const reviewerUser = await firstValueFrom(
              this.authClient.send(AUTH_PATTERNS.GET_USER, { id: r.reviewerId })
            );
            if (reviewerUser?.fullName) {
              reviewerName = reviewerUser.fullName;
            }
          } catch {}
          return {
            ...r,
            reviewerName,
          };
        })
      );
    }

    const { kycDocumentUrl, ...safeProfile } = profile || {};

    return {
      ...user,
      ...safeProfile,
      userId: id,
      fullName: safeProfile?.fullName || user?.fullName || 'Freelancer',
      rating: reviewsData?.avgRating ?? 5.0,
      totalReviews: reviewsData?.total ?? 0,
      reviews: enrichedReviews,
    };
  }

  @Get(':id/reviews')
  async getFreelancerReviews(@Param('id') id: string) {
    let reviewsData: any = { reviews: [], total: 0, avgRating: 5.0 };
    try {
      reviewsData = await firstValueFrom(
        this.contractClient.send(CONTRACT_PATTERNS.GET_USER_REVIEWS, { userId: id })
      );
    } catch (e) {}

    let enrichedReviews: any[] = [];
    if (reviewsData && Array.isArray(reviewsData.reviews)) {
      enrichedReviews = await Promise.all(
        reviewsData.reviews.map(async (r: any) => {
          let reviewerName = 'Khách hàng';
          try {
            const reviewerUser = await firstValueFrom(
              this.authClient.send(AUTH_PATTERNS.GET_USER, { id: r.reviewerId })
            );
            if (reviewerUser?.fullName) {
              reviewerName = reviewerUser.fullName;
            }
          } catch {}
          return {
            ...r,
            reviewerName,
          };
        })
      );
    }

    return {
      total: reviewsData.total,
      avgRating: reviewsData.avgRating,
      reviews: enrichedReviews,
    };
  }
}

