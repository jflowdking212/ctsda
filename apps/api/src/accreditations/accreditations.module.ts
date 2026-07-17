import { Module } from '@nestjs/common';
import { AccreditationsController } from './accreditations.controller';
import { AccreditationsService } from './accreditations.service';
import { PrismaService } from '../common/prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { CertificateProcessor } from './processors/certificate.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'certificates',
    }),
  ],
  controllers: [AccreditationsController],
  providers: [AccreditationsService, PrismaService, CertificateProcessor],
  exports: [AccreditationsService],
})
export class AccreditationsModule {}
