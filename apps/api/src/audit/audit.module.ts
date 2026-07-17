import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from './audit.service';

@Module({
  providers: [AuditService, PrismaService],
  exports: [AuditService],
})
export class AuditModule {}
