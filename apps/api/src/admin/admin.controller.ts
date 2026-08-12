import { Body, Controller, Get, Header, Param, Patch, Post, Query, Res, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApplicationStatus, UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('me')
  async me(@CurrentUser() user: any) {
    const profile = await this.adminService.getAdminProfile(user.userId);
    return { ...profile, sessionId: user.sessionId };
  }

  @Get('notifications')
  async getNotifications(@CurrentUser() user: any) {
    return this.adminService.getNotifications(user.userId);
  }

  @Post('notifications/read')
  async markNotificationsRead(@CurrentUser() user: any) {
    return this.adminService.markNotificationsRead(user.userId);
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

  @Post('applications/:id/start-review')
  async startReview(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.transitionApplication(user.userId, id, 'under_review', { reason: 'Review started' });
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

  @Post('applications/:id/manual-payment')
  async recordManualPayment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { amount?: number; currency?: string; reference?: string; notes?: string },
  ) {
    return this.adminService.recordManualPayment(user.userId, id, body);
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

  @Post('users')
  async createAdminUser(
    @CurrentUser() user: any,
    @Body() body: { email: string; firstName: string; lastName: string; role: UserRole; phone?: string },
  ) {
    return this.adminService.createAdminUser(user.userId, body);
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

  @Get('reports/summary')
  async reportSummary(@CurrentUser() user: any) {
    return this.adminService.getReportSummary(user.userId);
  }

  @Post('legacy/accredited-institutions')
  async createLegacyAccreditedInstitution(@CurrentUser() user: any, @Body() body: any) {
    return this.adminService.createLegacyAccreditedInstitution(user.userId, body);
  }

  @Get('reports/export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="ctsda-board-report.csv"')
  async exportReportCsv(@CurrentUser() user: any) {
    return this.adminService.exportReportCsv(user.userId);
  }

  @Get('reports/export.pdf')
  async exportReportPdf(@CurrentUser() user: any, @Res({ passthrough: true }) reply: any) {
    const pdf = await this.adminService.exportReportPdf(user.userId);
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', 'attachment; filename="ctsda-board-report.pdf"');
    return pdf;
  }

  @Post('upload')
  async uploadImage(@CurrentUser() user: any, @Req() req: any) {
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }
    const data = await req.file();
    if (!data) throw new BadRequestException('No file uploaded');

    const fileName = `${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9.\-]/g, '')}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, fileName);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const buffer = await data.toBuffer();
    fs.writeFileSync(filePath, buffer);

    return { url: `/uploads/${fileName}` };
  }
}
