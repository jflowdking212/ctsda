import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccreditationsService } from './accreditations.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('accreditations')
export class AccreditationsController {
  constructor(private accreditationsService: AccreditationsService) {}

  @Get()
  async listActive() {
    return this.accreditationsService.listActive();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.accreditationsService.findById(id);
  }

  @Post(':id/suspend')
  @UseGuards(AuthGuard)
  async suspend(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.accreditationsService.suspend(id, user.userId, body.reason);
  }

  @Post(':id/reactivate')
  @UseGuards(AuthGuard)
  async reactivate(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.accreditationsService.reactivate(id, user.userId, body.reason);
  }
}
