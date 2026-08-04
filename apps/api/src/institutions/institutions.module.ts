import { Module } from '@nestjs/common';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [InstitutionsController],
  providers: [InstitutionsService, PrismaService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}