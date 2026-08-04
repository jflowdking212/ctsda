import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../common/prisma.service';
import { ReviewsModule } from '../reviews/reviews.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AccreditationsService } from '../accreditations/accreditations.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'certificates' }),
    ReviewsModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, AccreditationsService],
})
export class AdminModule {}
