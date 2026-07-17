import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

interface SessionPayload {
  userId: string;
  role?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private redis: IORedis;

  constructor(private configService: ConfigService) {
    this.redis = new IORedis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['x-session-id'] || request.cookies['sessionId'];

    if (!sessionId) {
      throw new UnauthorizedException('No session provided');
    }

    const raw = await this.redis.get(`session:${sessionId}`);
    if (!raw) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // The session payload is JSON { userId, role } (post-A3). A bare string
    // would be a pre-launch legacy session; reject it so RBAC never degrades
    // to an undefined role silently — the user simply re-logs in.
    let payload: SessionPayload;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.userId) {
        throw new Error('not a session payload');
      }
      payload = parsed as SessionPayload;
    } catch {
      throw new UnauthorizedException('Session expired, please log in again');
    }

    // Attach role so RbacGuard (and service-layer checks) can authorise.
    request.user = {
      userId: payload.userId,
      id: payload.userId,
      sessionId,
      role: payload.role,
    };
    return true;
  }
}
