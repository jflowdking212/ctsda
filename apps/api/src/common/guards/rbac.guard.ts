import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Role-based access control, metadata-driven. Registered as a global
 * APP_GUARD in AppModule so any route annotated with @Roles(...) is enforced
 * without needing to add @UseGuards(RbacGuard) per route. Routes without
 * @Roles metadata are a no-op (public or AuthGuard-only routes).
 *
 * Relies on AuthGuard (instance-level, runs before global guards) having
 * populated request.user.role — which it now does from the session payload.
 */
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no @Roles on this route → no RBAC requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // @Roles applied to a route not protected by AuthGuard — treat as
      // unauthenticated rather than silently allowing.
      throw new UnauthorizedException('Authentication required');
    }

    // Super admin bypasses all role checks.
    if (user.role === 'super_admin') {
      return true;
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
