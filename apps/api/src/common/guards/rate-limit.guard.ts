import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class RateLimitGuard {
  private redis: IORedis;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(private configService: ConfigService) {
    this.redis = new IORedis(configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
    this.windowMs = 60_000; // 1 minute
    this.maxRequests = parseInt(configService.get<string>('RATE_LIMIT_MAX', '10'), 10);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = `ratelimit:${request.ip}:${request.route?.path || request.url}`;

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.pexpire(key, this.windowMs);
    }

    if (current > this.maxRequests) {
      throw new ForbiddenException('Too many requests');
    }

    return true;
  }
}
