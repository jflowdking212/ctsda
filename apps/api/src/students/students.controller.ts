import { Body, Controller, Get, Param, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get('all')
  @UseGuards(AuthGuard)
  async listAll() {
    return this.studentsService.listAll();
  }

  @Post('manual')
  @UseGuards(AuthGuard)
  async issueManual(
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.studentsService.issueManualStudentCertificate(user.userId, body);
  }

  @Get('verify/:token')
  async verifyCertificate(@Param('token') token: string) {
    const cert = await this.studentsService.findByCertificateNumberOrToken(token);
    if (!cert) {
      return { valid: false, message: 'Student certificate not found or invalid.' };
    }
    return {
      valid: cert.status === 'active',
      message: cert.status === 'active' ? 'Student Certificate is authentic and valid' : `Certificate status: ${cert.status}`,
      recipientName: cert.studentName,
      courseProgram: cert.courseProgram,
      institution: cert.institutionName,
      certificateNumber: cert.certificateNumber,
      grade: cert.grade,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      status: cert.status,
      qrCodeUrl: cert.qrCodeUrl,
    };
  }

  @Post(':id/update-expiry')
  @UseGuards(AuthGuard)
  async updateExpiry(
    @Param('id') id: string,
    @Body() body: { expiresAt?: string },
  ) {
    return this.studentsService.updateExpiry(id, body.expiresAt);
  }

  @Post(':id/suspend')
  @UseGuards(AuthGuard)
  async suspend(@Param('id') id: string) {
    return this.studentsService.suspend(id);
  }

  @Post(':id/reactivate')
  @UseGuards(AuthGuard)
  async reactivate(@Param('id') id: string) {
    return this.studentsService.reactivate(id);
  }

  @Post(':id/delete')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    return this.studentsService.delete(id);
  }
}
