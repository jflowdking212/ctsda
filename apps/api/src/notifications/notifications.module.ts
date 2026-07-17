import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './processors/email.processor';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailProcessor, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}