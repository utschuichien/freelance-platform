import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, AUTH_CONSTANTS } from '@app/shared';
import { JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { PROJECT_CONSTANTS } from '@app/shared/constants/project.constants';
import { RABBITMQ_CONFIG, createEventHeaders } from '@app/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private amqpConnection: AmqpConnection,
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email đã được đăng ký');
    }

    const salt = await bcrypt.genSalt(AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    return { message: 'Đăng ký tài khoản thành công', user };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const jti = randomUUID();
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      jti: jti,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN });

    // Store refresh token in db
    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS),
        expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE_MS),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      if (payload?.userId) {
        await this.prisma.refreshToken.deleteMany({
          where: { userId: payload.userId },
        });
      }
    } catch (error) {
    }
    return { success: true };
  }

  async refreshToken(token: string) {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    if (!payload?.userId || !payload?.jti)
      throw new UnauthorizedException('Token không hợp lệ');

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || !user.isActive)
      throw new UnauthorizedException('User không hợp lệ');

    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });

    if (!stored || stored.isRevoked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Token đã bị thu hồi hoặc không tồn tại');
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Token đã hết hạn');
    }
    const isValidToken = await bcrypt.compare(token, stored.tokenHash);
    if (!isValidToken) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    const newJti = randomUUID();
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      jti: newJti,
    };
    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
    });
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN,
    });

    await this.prisma.$transaction([
      this.prisma.refreshToken.delete({ where: { id: stored.id } }),
      this.prisma.refreshToken.create({
        data: {
          id: newJti,
          userId: user.id,
          tokenHash: await bcrypt.hash(newRefreshToken, AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS),
          expiresAt: new Date(Date.now() + AUTH_CONSTANTS.REFRESH_TOKEN_MAX_AGE_MS),
        },
      }),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }
    return user;
  }

  async getFreelancers(cursor?: string) {
    const limit = PROJECT_CONSTANTS.PAGINATION_LIMIT;
    const freelancers = await this.prisma.user.findMany({
      where: { role: 'FREELANCER' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor } } : {}),
      orderBy: [
        { createdAt: 'desc' },
        { id: 'asc' }
      ],
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        createdAt: true,
      }
    });

    let nextCursor: string | null = null;
    if (freelancers.length > limit) {
      const nextItem = freelancers.pop();
      nextCursor = nextItem!.id;
    }

    return {
      data: freelancers,
      nextCursor
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });
  }

  async updateUserStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true }
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {

      return { message: 'Mã xác nhận đã được gửi đến email của bạn nếu email này tồn tại.' };
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds

    await this.prisma.otp.create({
      data: {
        email,
        code,
        expiresAt,
        type: 'PASSWORD_RESET',
      },
    });
    // Publish event to RabbitMQ for Notification Service to handle
    await this.amqpConnection.publish(
      RABBITMQ_CONFIG.EXCHANGES.TOPIC_EXCHANGE,
      RABBITMQ_CONFIG.ROUTING_KEYS.SEND_OTP_EMAIL,
      {
        email,
        code,
        fullName: user.fullName,
      },
      {
        headers: createEventHeaders('auth-service'),
        persistent: true,
      },
    );

    return { message: 'Mã xác nhận đã được gửi đến email của bạn nếu email này tồn tại.' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        email,
        code,
        type: 'PASSWORD_RESET',
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) {
      throw new BadRequestException('Mã xác nhận không chính xác');
    }

    if (otp.expiresAt < new Date()) {
      throw new BadRequestException('Mã xác nhận đã hết hạn');
    }

    const salt = await bcrypt.genSalt(AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email },
        data: { passwordHash },
      }),
      this.prisma.otp.update({
        where: { id: otp.id },
        data: { isUsed: true },
      }),
    ]);

    return { message: 'Đổi mật khẩu thành công' };
  }
}
