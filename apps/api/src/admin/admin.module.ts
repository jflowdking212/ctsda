import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../common/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import { AccreditationsService } from '../accreditations/accreditations.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'certificates' })],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, ReviewsService, AccreditationsService],
})
export class AdminModule {}
