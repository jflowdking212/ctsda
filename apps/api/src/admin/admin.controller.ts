import { Body, Controller, Get, Header, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApplicationStatus, UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.adminService.getAdminProfile(user.userId);
  }

  @Get('applications')
  async listApplications(
    @CurrentUser() user: any,
    @Query('status') status?: ApplicationStatus,
    @Query('reviewerId') reviewerId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.adminService.listApplications(user.userId, { status, reviewerId, from, to });
  }

  @Get('applications/:id')
  async getApplication(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.getApplication(user.userId, id);
  }

  @Post('applications/:id/approve')
  async approve(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { reason?: string; comments?: string }) {
    return this.adminService.transitionApplication(user.userId, id, 'approved', body);
  }

  @Post('applications/:id/reject')
  async reject(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { reason?: string; comments?: string }) {
    return this.adminService.transitionApplication(user.userId, id, 'rejected', body);
  }

  @Post('applications/:id/undo-reject')
  async undoReject(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.transitionApplication(user.userId, id, 'under_review', {
      reason: body.reason || 'Rejection undone',
    });
  }

  @Post('applications/:id/request-changes')
  async requestChanges(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { reason?: string; comments?: string },
  ) {
    return this.adminService.transitionApplication(user.userId, id, 'changes_requested', body);
  }

  @Patch('applications/:id/reviewer')
  async assignReviewer(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { reviewerId: string }) {
    return this.adminService.assignReviewer(user.userId, id, body.reviewerId);
  }

  @Post('applications/:id/comments')
  async addComment(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { content: string; isInternal?: boolean }) {
    return this.adminService.addComment(user.userId, id, body.content, body.isInternal ?? true);
  }

  @Patch('applications/:id/notes')
  async updateNotes(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { notes: string }) {
    return this.adminService.updateReviewerNotes(user.userId, id, body.notes);
  }

  @Post('applications/:id/checklist')
  async createChecklistItem(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { label: string }) {
    return this.adminService.createChecklistItem(user.userId, id, body.label);
  }

  @Patch('checklist/:id')
  async setChecklistItem(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { isCompleted: boolean }) {
    return this.adminService.setChecklistItem(user.userId, id, body.isCompleted);
  }

  @Get('institutions')
  async listInstitutions(@CurrentUser() user: any) {
    return this.adminService.listInstitutions(user.userId);
  }

  @Patch('institutions/:id')
  async updateInstitution(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.adminService.updateInstitution(user.userId, id, body);
  }

  @Patch('institutions/:id/logo')
  async updateInstitutionLogo(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { logoUrl: string }) {
    return this.adminService.updateInstitution(user.userId, id, { logoUrl: body.logoUrl });
  }

  @Get('institutions/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="ctsda-institutions.csv"')
  async exportInstitutions(@CurrentUser() user: any) {
    return this.adminService.exportInstitutionsCsv(user.userId);
  }

  @Post('accreditations/:id/suspend')
  async suspendAccreditation(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.suspendAccreditation(user.userId, id, body.reason);
  }

  @Post('accreditations/:id/reactivate')
  async reactivateAccreditation(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.reactivateAccreditation(user.userId, id, body.reason);
  }

  @Get('users')
  async listUsers(@CurrentUser() user: any) {
    return this.adminService.listUsers(user.userId);
  }

  @Patch('users/:id')
  async updateUser(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { role?: UserRole; isActive?: boolean }) {
    return this.adminService.updateUser(user.userId, id, body);
  }

  @Post('settings/password')
  async changePassword(@CurrentUser() user: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.adminService.changePassword(user.userId, body.currentPassword, body.newPassword);
  }

  @Get('audit-logs')
  async listAuditLogs(@CurrentUser() user: any) {
    return this.adminService.listAuditLogs(user.userId);
  }
}
