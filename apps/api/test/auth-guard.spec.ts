import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../src/common/guards/auth.guard';

describe('AuthGuard security', () => {
  function context(headers: Record<string, string> = {}, cookies: Record<string, string> = {}) {
    const request = { headers, cookies, user: undefined as any };
    return {
      request,
      ctx: {
        switchToHttp: () => ({ getRequest: () => request }),
      } as any,
    };
  }

  it('rejects unauthenticated admin/API access', async () => {
    const guard = new AuthGuard({ get: jest.fn().mockReturnValue('redis://localhost:6379') } as any);

    const { ctx } = context();
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects legacy bare-string sessions so RBAC cannot lose role context', async () => {
    const guard = new AuthGuard({ get: jest.fn().mockReturnValue('redis://localhost:6379') } as any);
    (guard as any).redis = { get: jest.fn().mockResolvedValue('user-1') };

    const { ctx } = context({ 'x-session-id': 'session-1' });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches user id and role from signed-in session payload', async () => {
    const guard = new AuthGuard({ get: jest.fn().mockReturnValue('redis://localhost:6379') } as any);
    (guard as any).redis = {
      get: jest.fn().mockResolvedValue(JSON.stringify({ userId: 'user-1', role: 'super_admin' })),
    };

    const { ctx, request } = context({ 'x-session-id': 'session-1' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.user).toEqual({
      userId: 'user-1',
      id: 'user-1',
      sessionId: 'session-1',
      role: 'super_admin',
    });
  });
});
