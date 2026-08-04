import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from '../common/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'certificates' }),
    NotificationsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
