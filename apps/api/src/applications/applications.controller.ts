import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('applications')
@UseGuards(AuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get('me')
  async findMy(@CurrentUser() user: any) {
    return this.applicationsService.getMyApplications(user.userId);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.applicationsService.submitApplication(id, user.userId);
  }
}