import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

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

    const userId = await this.redis.get(`session:${sessionId}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    request.user = { userId, id: userId, sessionId };
    return true;
  }
}
