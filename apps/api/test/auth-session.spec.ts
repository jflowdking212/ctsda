import { AuthController } from '../src/auth/auth.controller';

describe('AuthController sessions and security flows', () => {
  it('sets an HttpOnly session cookie on successful login', async () => {
    const authService = {
      assertLoginNotLocked: jest.fn().mockResolvedValue(undefined),
      validateUser: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'admin@ctsda.org',
        role: 'applicant',
      }),
      isAdminRole: jest.fn().mockReturnValue(false),
      createSession: jest.fn().mockResolvedValue('session-1'),
      clearLoginFailures: jest.fn().mockResolvedValue(undefined),
      recordLogin: jest.fn().mockResolvedValue(undefined),
    } as any;
    const reply = { setCookie: jest.fn() };
    const req = { ip: '127.0.0.1', headers: { 'user-agent': 'jest' } };

    const controller = new AuthController(authService);
    const result = await controller.login(
      { email: 'admin@ctsda.org', password: 'secret' },
      req,
      reply,
    );

    expect(result.accessToken).toBe('session-1');
    expect(reply.setCookie).toHaveBeenCalledWith(
      'sessionId',
      'session-1',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });

  it('records failed login attempts before rejecting invalid credentials', async () => {
    const authService = {
      assertLoginNotLocked: jest.fn().mockResolvedValue(undefined),
      validateUser: jest.fn().mockResolvedValue(null),
      incrementLoginFailures: jest.fn().mockResolvedValue(undefined),
      recordFailedLogin: jest.fn().mockResolvedValue(undefined),
    } as any;
    const req = { ip: '127.0.0.1', headers: { 'user-agent': 'jest' } };
    const controller = new AuthController(authService);

    await expect(
      controller.login({ email: 'admin@ctsda.org', password: 'wrong' }, req, { setCookie: jest.fn() }),
    ).rejects.toThrow('Invalid credentials');

    expect(authService.assertLoginNotLocked).toHaveBeenCalledWith('admin@ctsda.org', '127.0.0.1');
    expect(authService.incrementLoginFailures).toHaveBeenCalledWith('admin@ctsda.org', '127.0.0.1');
    expect(authService.recordFailedLogin).toHaveBeenCalledWith('admin@ctsda.org', '127.0.0.1', 'jest');
  });

  it('requires forced password reset before admin TOTP/session creation', async () => {
    const authService = {
      assertLoginNotLocked: jest.fn().mockResolvedValue(undefined),
      validateUser: jest.fn().mockResolvedValue({
        id: 'admin-1',
        email: 'admin@ctsda.org',
        role: 'super_admin',
        forcePasswordReset: true,
      }),
      isAdminRole: jest.fn().mockReturnValue(true),
      createSession: jest.fn(),
      verifyTotp: jest.fn(),
    } as any;
    const controller = new AuthController(authService);

    await expect(
      controller.login(
        { email: 'admin@ctsda.org', password: 'temporary' },
        { ip: '127.0.0.1', headers: { 'user-agent': 'jest' } },
        { setCookie: jest.fn() },
      ),
    ).resolves.toEqual({
      requiresPasswordReset: true,
      message: 'Password reset is required before dashboard access.',
    });

    expect(authService.verifyTotp).not.toHaveBeenCalled();
    expect(authService.createSession).not.toHaveBeenCalled();
  });

  it('does not enable TOTP when verification fails', async () => {
    const authService = {
      verifyTotp: jest.fn().mockResolvedValue(false),
      enableTotp: jest.fn().mockResolvedValue(undefined),
    } as any;
    const controller = new AuthController(authService);

    await expect(controller.verifyTotp({ userId: 'user-1' }, { code: '123456' })).rejects.toThrow(
      'Invalid TOTP code',
    );

    expect(authService.enableTotp).not.toHaveBeenCalled();
  });

  it('returns a generic forgot-password response to avoid account enumeration', async () => {
    const authService = {
      requestPasswordReset: jest.fn().mockResolvedValue({ success: true }),
    } as any;
    const controller = new AuthController(authService);

    await expect(controller.forgotPassword({ email: 'person@example.com' })).resolves.toEqual({
      success: true,
      message: 'If the account exists, a reset link has been sent.',
    });
  });
});
