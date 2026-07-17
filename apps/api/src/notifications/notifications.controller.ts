import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post('send')
  async send(@CurrentUser() user: any, @Body() body: { to: string; subject: string; html: string }) {
    await this.notificationsService.enqueueEmail({
      to: body.to,
      subject: body.subject,
      html: body.html,
      userId: user.userId,
    });
    return { success: true, message: 'Email queued' };
  }
}