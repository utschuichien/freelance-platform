import { Controller, Get, Patch, Body, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, JwtUserPayload } from '../auth/current-user.decorator';
import { USER_PATTERNS, CONTRACT_PATTERNS, AUTH_PATTERNS } from '@app/shared';
import { firstValueFrom } from 'rxjs';

@Controller('api/users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    @Inject('CONTRACT_SERVICE') private contractClient: ClientProxy,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
  ) {}

  @Get('me/profile')
  async getMyProfile(@CurrentUser() user: JwtUserPayload) {
    const userId = user.userId;
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.GET_PROFILE, { userId })
    );
  }

  @Patch('me/profile')
  async updateMyProfile(
    @CurrentUser() user: JwtUserPayload,
    @Body() data: any,
  ) {
    const userId = user.userId;
    return firstValueFrom(
      this.userClient.send(USER_PATTERNS.UPDATE_PROFILE, { userId, data })
    );
  }

  @Get('me/reviews')
  async getMyReviews(@CurrentUser() user: JwtUserPayload) {
    const userId = user.userId;
    let reviewsData: any = { reviews: [], total: 0, avgRating: 5.0 };
    try {
      reviewsData = await firstValueFrom(
        this.contractClient.send(CONTRACT_PATTERNS.GET_USER_REVIEWS, { userId })
      );
    } catch (e) {}

    let enrichedReviews: any[] = [];
    if (reviewsData && Array.isArray(reviewsData.reviews)) {
      enrichedReviews = await Promise.all(
        reviewsData.reviews.map(async (r: any) => {
          let reviewerName = 'Đối tác';
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


