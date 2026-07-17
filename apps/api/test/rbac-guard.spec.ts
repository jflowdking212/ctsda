import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGuard } from '../src/common/guards/rbac.guard';
import { ROLES_KEY, Roles } from '../src/common/decorators/roles.decorator';

class FakeHandler {
  @Roles('content_manager', 'super_admin')
  method() {}
}

describe('RbacGuard (metadata-driven)', () => {
  let reflector: Reflector;
  let guard: RbacGuard;
  let ctx: any;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RbacGuard(reflector);
    ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: undefined }) }),
      getHandler: () => FakeHandler.prototype.method,
      getClass: () => FakeHandler,
    };
  });

  it('no-ops when no @Roles metadata is present', () => {
    const plainCtx = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
      getHandler: () => function noRoles() {},
      getClass: () => class Plain {},
    };
    expect(guard.canActivate(plainCtx as any)).toBe(true);
  });

  it('rejects when no user is attached (route not guarded by AuthGuard)', () => {
    ctx.switchToHttp = () => ({ getRequest: () => ({ user: undefined }) });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('blocks an applicant from a content_manager route', () => {
    ctx.switchToHttp = () => ({ getRequest: () => ({ user: { role: 'applicant' } }) });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows a content_manager', () => {
    ctx.switchToHttp = () => ({ getRequest: () => ({ user: { role: 'content_manager' } }) });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('super_admin bypasses any role requirement', () => {
    ctx.switchToHttp = () => ({ getRequest: () => ({ user: { role: 'super_admin' } }) });
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
