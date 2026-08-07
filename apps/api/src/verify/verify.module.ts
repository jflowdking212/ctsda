import { Module } from '@nestjs/common';
import { VerifyController } from './verify.controller';
import { ReviewsModule } from '../reviews/reviews.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [ReviewsModule, StudentsModule],
  controllers: [VerifyController],
})
export class VerifyModule {}
