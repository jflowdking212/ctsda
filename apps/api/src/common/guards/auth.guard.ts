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
    const sessionCandidates = [
      request.cookies?.sessionId,
      request.headers['x-session-id'],
    ].filter(Boolean) as string[];

    if (sessionCandidates.length === 0) {
      throw new UnauthorizedException('No session provided');
    }

    for (const sessionId of [...new Set(sessionCandidates)]) {
      const raw = await this.redis.get(`session:${sessionId}`);
      if (!raw) continue;

      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !parsed.userId) continue;

        const payload = parsed as SessionPayload;
        request.user = {
          userId: payload.userId,
          id: payload.userId,
          sessionId,
          role: payload.role,
        };
        return true;
      } catch {
        continue;
      }
    }

    throw new UnauthorizedException('Invalid or expired session');
  }
}
