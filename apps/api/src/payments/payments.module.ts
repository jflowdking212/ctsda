import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../common/prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { PaymentProcessor } from './processors/payment.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payments',
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentProcessor, PrismaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}