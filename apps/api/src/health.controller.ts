import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaClient } from '@ctsda/db';
import IORedis from 'ioredis';

@Controller()
@SkipThrottle()
export class HealthController {
  private prisma: PrismaClient;
  private redis: IORedis;

  constructor(private configService: ConfigService) {
    this.prisma = new PrismaClient();
    this.redis = new IORedis(configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
  }

  @Get('/health')
  async health() {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();

    return {
      status: dbStatus === 'healthy' && redisStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }

  @Get('/ready')
  async readiness() {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();

    if (dbStatus !== 'healthy' || redisStatus !== 'healthy') {
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'healthy';
    } catch {
      return 'unhealthy';
    }
  }

  private async checkRedis(): Promise<string> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG' ? 'healthy' : 'unhealthy';
    } catch {
      return 'unhealthy';
    }
  }
}
