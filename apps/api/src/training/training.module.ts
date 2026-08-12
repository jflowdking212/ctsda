import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'email' })],
  controllers: [TrainingController],
  providers: [TrainingService, PrismaService],
})
export class TrainingModule {}
