import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Inject,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ClientProxy } from '@nestjs/microservices';
import {
  RegisterDto,
  LoginDto,
  AUTH_PATTERNS,
  AUTH_CONSTANTS,
} from '@app/shared';
import { firstValueFrom } from 'rxjs';
import { type Response, type Request } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) { }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) 
  @Post('register')
  async register(@Body() data: RegisterDto) {
    return await firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.REGISTER, data),
    );
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) 
  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.LOGIN, data),
    );
    res.cookie('accessToken', response.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE_MS,
    });

    res.cookie('refreshToken', response.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE_MS,
    });

    return {
      message: 'Đăng nhập thành công',
      user: response.user,
    };
  }
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    res.clearCookie('accessToken', { sameSite: 'lax' });
    res.clearCookie('refreshToken', { sameSite: 'lax' });

    if (refreshToken) {
      try {
        await firstValueFrom(
          this.authClient.send(AUTH_PATTERNS.LOGOUT, { refreshToken }),
        );
      } catch (e) {
      }
    }

    return { message: 'Đăng xuất thành công' };
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Very strict: 3 requests per 60 seconds
  @Post('forgot-password')
  async forgotPassword(@Body() data: { email: string }) {
    return await firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.FORGOT_PASSWORD, data),
    );
  }

  @Post('reset-password')
  async resetPassword(@Body() data: any) {
    return await firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.RESET_PASSWORD, data),
    );
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token');
    }

    try {
      const response = await firstValueFrom(
        this.authClient.send(AUTH_PATTERNS.REFRESH_TOKEN, { refreshToken }),
      );

      res.cookie('accessToken', response.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AUTH_CONSTANTS.ACCESS_TOKEN_MAX_AGE_MS,
      });

      res.cookie('refreshToken', response.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE_MS,
      });

      return {
        message: 'Làm mới token thành công',
        user: response.user,
      };
    } catch (error) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn');
    }
  }

  @SkipThrottle() // Healthcheck or standard profiles don't need strict throttling (uses global default 100/min)
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req['user'];
    const profile = await firstValueFrom(
      this.userClient.send('GET_PROFILE', { userId: user.id }),
    );
    return profile;
  }

  @UseGuards(AuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: Request, @Body() data: any) {
    const user = req['user'];
    const profile = await firstValueFrom(
      this.userClient.send('UPDATE_PROFILE', { userId: user.id, data }),
    );
    return profile;
  }
}
