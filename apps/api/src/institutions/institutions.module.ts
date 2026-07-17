import { Module } from '@nestjs/common';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InstitutionsController],
  providers: [InstitutionsService, PrismaService],
  exports: [InstitutionsService],
})
export class InstitutionsModule {}