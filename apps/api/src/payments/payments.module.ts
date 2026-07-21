import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../common/prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { PaymentProcessor } from './processors/payment.processor';
import { SettingsModule } from '../settings/settings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payments',
    }),
    SettingsModule,
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentProcessor, PrismaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}