import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Patch('applications/:id/status')
  @UseGuards(AuthGuard)
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() body: { status: string; reason?: string; comments?: string },
  ) {
    return this.reviewsService.transitionStatus(
      applicationId,
      body.status as ApplicationStatus,
      user.userId,
      { reason: body.reason, comments: body.comments },
    );
  }

  @Post('applications/:id/reject')
  @UseGuards(AuthGuard)
  async rejectApplication(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() body: { reason?: string; comments?: string },
  ) {
    return this.reviewsService.transitionStatus(applicationId, 'rejected', user.userId, body);
  }

  @Post('applications/:id/undo-reject')
  @UseGuards(AuthGuard)
  async undoReject(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() body: { reason?: string },
  ) {
    return this.reviewsService.transitionStatus(applicationId, 'under_review', user.userId, {
      reason: body.reason || 'Rejection undone',
    });
  }

  @Post('applications/:id/request-changes')
  @UseGuards(AuthGuard)
  async requestChanges(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() body: { reason?: string; comments?: string },
  ) {
    return this.reviewsService.transitionStatus(applicationId, 'changes_requested', user.userId, body);
  }

  @Patch('applications/:id/reviewer')
  @UseGuards(AuthGuard)
  async assignReviewer(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() body: { reviewerId: string },
  ) {
    return this.reviewsService.assignReviewer(applicationId, body.reviewerId, user.userId);
  }

  @Post('applications/:id/comments')
  @UseGuards(AuthGuard)
  async addComment(
    @CurrentUser() user: any,
    @Param('id') applicationId: string,
    @Body() body: { content: string; isInternal?: boolean },
  ) {
    return this.reviewsService.addComment(applicationId, user.userId, body.content, body.isInternal);
  }

  @Post('applications/:id/checklist')
  @UseGuards(AuthGuard)
  async createChecklistItem(@Param('id') applicationId: string, @Body() body: { label: string }) {
    return this.reviewsService.createChecklistItem(applicationId, body.label);
  }

  @Patch('checklist/:id')
  @UseGuards(AuthGuard)
  async setChecklistItem(
    @CurrentUser() user: any,
    @Param('id') itemId: string,
    @Body() body: { isCompleted: boolean },
  ) {
    return this.reviewsService.setChecklistItemCompleted(itemId, user.userId, body.isCompleted);
  }

  @Get('institutions')
  async listInstitutions() {
    return this.reviewsService.listInstitutions();
  }
}
