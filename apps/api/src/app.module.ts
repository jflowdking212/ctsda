import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import IORedis from 'ioredis';

import { RbacGuard } from './common/guards/rbac.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { ApplicationsModule } from './applications/applications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DocumentsModule } from './documents/documents.module';
import { AccreditationsModule } from './accreditations/accreditations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { VerifyController } from './verify/verify.controller';
import { HealthController } from './health.controller';
import { SettingsModule } from './settings/settings.module';
import { BlogModule } from './blog/blog.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TrainingModule } from './training/training.module';
import { createPinoRedactOptions } from './common/logging/redaction';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '../../.env', '../../.env.local'],
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('LOG_LEVEL', 'debug'),
          transport:
            configService.get('NODE_ENV') !== 'production'
              ? { target: 'pino-pretty', options: { colorize: true } }
              : undefined,
          redact: createPinoRedactOptions(),
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          { name: 'default', ttl: 60_000, limit: 100 },
          { name: 'strict', ttl: 60_000, limit: 10 },
        ],
        storage: new ThrottlerStorageRedisService(
          new IORedis(configService.get<string>('REDIS_URL', 'redis://localhost:6379')),
        ),
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: new IORedis(configService.get<string>('REDIS_URL', 'redis://localhost:6379'), {
          maxRetriesPerRequest: null,
        }),
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: { age: 7 * 24 * 60 * 60, count: 1000 },
          removeOnFail: { age: 14 * 24 * 60 * 60 },
        },
      }),
    }),
    AuthModule,
    UsersModule,
    InstitutionsModule,
    ApplicationsModule,
    ReviewsModule,
    DocumentsModule,
    AccreditationsModule,
    NotificationsModule,
    PaymentsModule,
    AdminModule,
    SettingsModule,
    BlogModule,
    SubscriptionsModule,
    TrainingModule,
  ],
  controllers: [HealthController, VerifyController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
