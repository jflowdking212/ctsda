import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import IORedis from 'ioredis';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';

const ADMIN_ROLES = [
  'super_admin',
  'reviewer',
  'finance_officer',
  'support_officer',
  'content_manager',
  'auditor',
];

const LOGIN_FAILURE_LIMIT = 6;
const LOGIN_FAILURE_WINDOW_SECONDS = 15 * 60;

@Injectable()
export class AuthService {
  private redis: IORedis;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {
    this.redis = new IORedis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return null;
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isTotpEnabled: user.isTotpEnabled,
      totpSecret: user.totpSecret,
      forcePasswordReset: user.forcePasswordReset,
    };
  }

  async registerApplicant(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const emailVerificationToken = randomBytes(32).toString('base64url');

    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: await this.hashPassword(data.password),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'applicant',
        isEmailVerified: false,
        emailVerificationToken,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'user_created',
      entityType: 'user',
      entityId: user.id,
      metadata: { emailVerificationPending: true },
    });

    return { user, emailVerificationToken };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationToken: null },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'email_verified',
      entityType: 'user',
      entityId: user.id,
    });

    return { success: true };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: true };
    }

    const passwordResetToken = randomBytes(32).toString('base64url');
    const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken, passwordResetExpiresAt },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'password_reset_requested',
      entityType: 'user',
      entityId: user.id,
      metadata: { expiresAt: passwordResetExpiresAt.toISOString() },
    });

    return { success: true, passwordResetToken };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    await this.revokeUserSessions(user.id);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await this.hashPassword(password),
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        forcePasswordReset: false,
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'password_changed',
      entityType: 'user',
      entityId: user.id,
      metadata: { resetFlow: true },
    });

    return { success: true };
  }

  async createSession(
    userId: string,
    role: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const sessionId = uuidv4();
    const ttl = parseInt(this.configService.get('SESSION_TTL_SECONDS', '86400'), 10);
    const expiresAt = new Date(Date.now() + ttl * 1000);

    await this.prisma.session.create({
      data: { id: sessionId, userId, ipAddress, userAgent, expiresAt },
    });

    // Store role alongside userId in the Redis payload so AuthGuard can
    // populate request.user.role without a per-request DB hit — this is what
    // makes RbacGuard functional (previously user.role was always undefined).
    const payload = JSON.stringify({ userId, role });
    await this.redis.setex(`session:${sessionId}`, ttl, payload);
    return sessionId;
  }

  loginFailureKey(email: string, ipAddress = 'unknown') {
    return `login-failures:${ipAddress}:${email.toLowerCase()}`;
  }

  async assertLoginNotLocked(email: string, ipAddress?: string) {
    const failures = Number(await this.redis.get(this.loginFailureKey(email, ipAddress)) || 0);
    if (failures >= LOGIN_FAILURE_LIMIT) {
      throw new UnauthorizedException('Too many failed login attempts. Try again later.');
    }
  }

  async incrementLoginFailures(email: string, ipAddress?: string) {
    const key = this.loginFailureKey(email, ipAddress);
    const failures = await this.redis.incr(key);
    if (failures === 1) {
      await this.redis.expire(key, LOGIN_FAILURE_WINDOW_SECONDS);
    }
  }

  async clearLoginFailures(email: string, ipAddress?: string) {
    await this.redis.del(this.loginFailureKey(email, ipAddress));
  }

  async revokeSession(sessionId: string) {
    const raw = await this.redis.get(`session:${sessionId}`);
    if (raw) {
      // Delete by id (already unique to this session) — sufficient for cleanup
      // regardless of whether the payload is the new JSON shape or a legacy
      // bare-string session.
      await this.prisma.session.deleteMany({ where: { id: sessionId } });
      await this.redis.del(`session:${sessionId}`);
    }
  }

  async revokeUserSessions(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      select: { id: true },
    });

    if (sessions.length > 0) {
      await this.redis.del(...sessions.map((session) => `session:${session.id}`));
    }

    await this.prisma.session.deleteMany({ where: { userId } });
  }

  isAdminRole(role: string): boolean {
    return ADMIN_ROLES.includes(role);
  }

  async recordLogin(userId: string, ipAddress?: string, userAgent?: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    await this.auditService.log({
      userId,
      action: 'login',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
    });
  }

  async recordFailedLogin(email: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return;

    await this.auditService.log({
      userId: user.id,
      action: 'login_failed',
      entityType: 'user',
      entityId: user.id,
      ipAddress,
      userAgent,
      metadata: { email },
    });
  }

  async recordLogout(userId: string, ipAddress?: string, userAgent?: string) {
    await this.auditService.log({
      userId,
      action: 'logout',
      entityType: 'user',
      entityId: userId,
      ipAddress,
      userAgent,
    });
  }

  async hashPassword(password: string) {
    return argon2.hash(password);
  }

  async setupTotp(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = authenticator.generateSecret();
    const issuer = this.configService.get<string>('TOTP_ISSUER', 'CTSDA');
    const otpauth = authenticator.keyuri(user.email, issuer, secret);

    await this.prisma.user.update({
      where: { id: userId },
      data: { totpSecret: secret, isTotpEnabled: false },
    });

    return { secret, qrCodeUrl: await QRCode.toDataURL(otpauth) };
  }

  async verifyTotp(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.totpSecret) {
      return false;
    }

    return authenticator.verify({ token: code, secret: user.totpSecret });
  }

  async enableTotp(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isTotpEnabled: true },
    });
  }
}
