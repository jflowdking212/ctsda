import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@ctsda/contracts';

export const ROLES_KEY = 'roles';

/**
 * Mark a route as requiring one of the given roles. Enforced by RbacGuard
 * (registered as a global APP_GUARD). Routes without @Roles are unaffected.
 *
 * Usage:
 *   @Post('posts')
 *   @UseGuards(AuthGuard)
 *   @Roles('content_manager', 'super_admin')
 *   async createPost(...) { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
