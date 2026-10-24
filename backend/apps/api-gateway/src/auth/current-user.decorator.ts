import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class JwtUserPayload {
  userId: string;
  email: string;
  role: string;
  jti?: string;
}

/**
 * Custom decorator to extract authenticated user payload from request object
 * Usage:
 *   @CurrentUser() user: JwtUserPayload
 *   @CurrentUser('userId') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtUserPayload | undefined;
    if (!user) {
      return null;
    }
    return data ? user[data] : user;
  },
);
