import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // Support both HttpOnly cookie and Bearer token in Authorization header
    let token = request.cookies?.['accessToken'];
    if (!token && request.headers.authorization) {
      const [bearer, headerToken] = request.headers.authorization.split(' ');
      if (bearer === 'Bearer' && headerToken) {
        token = headerToken;
      }
    }

    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập để thực hiện chức năng này');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }
    return true;
  }
}
