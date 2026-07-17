import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@ctsda/contracts';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private requiredRoles: UserRole[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user context');
    }

    // Super admin bypasses all role checks
    if (user.role === 'super_admin') {
      return true;
    }

    if (!this.requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
