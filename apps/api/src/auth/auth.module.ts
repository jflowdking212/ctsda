import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [UsersModule, AuditModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
