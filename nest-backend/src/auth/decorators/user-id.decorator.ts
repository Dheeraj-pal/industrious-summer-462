import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract userId from request.user (populated by JWT strategy)
 * Usage: @UserId() userId: string
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
); 