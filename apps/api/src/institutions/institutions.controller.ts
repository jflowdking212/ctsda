import { Controller, Post, Body, UseGuards, Get, Param, BadRequestException } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { AuthService } from '../auth/auth.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('institutions')
export class InstitutionsController {
  constructor(
    private institutionsService: InstitutionsService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private settingsService: SettingsService,
  ) {}

  @Post('pre-registrations')
  async preRegister(@Body() body: { email: string; institutionId?: string }) {
    const preRegistration = await this.institutionsService.createPreRegistration(body);
    return {
      token: preRegistration.token,
      expiresAt: preRegistration.expiresAt,
    };
  }

  @Get('pre-registrations/:token')
  async validatePreRegistration(@Param('token') token: string) {
    const preRegistration = await this.institutionsService.validatePreRegistration(token);
    return {
      email: preRegistration.email,
      institutionId: preRegistration.institutionId,
      expiresAt: preRegistration.expiresAt,
    };
  }

  @Post('public-apply')
  async publicApply(@Body() body: any) {
    // 1. Verify OTP
    await this.authService.verifyOtp(body.email, body.otp, true);

    // 3. Create Institution
    const institution = await this.institutionsService.createInstitution({
      ...body.institution,
      contacts: [
        {
          fullName: `${body.firstName} ${body.lastName}`,
          position: 'Applicant',
          email: body.email,
          phone: body.phone || 'N/A',
          isPrimary: true,
        },
      ],
    });

    // 4. Create Application (with submitted status)
    const application = await this.institutionsService.createApplication({
      institutionId: institution.id,
      applicantFirstName: body.firstName,
      applicantLastName: body.lastName,
      applicantEmail: body.email,
      applicantPhone: body.phone,
      ...body.application,
    });

    if (!application) {
      throw new BadRequestException('Failed to create application');
    }

    // 5. Update Application to 'submitted' directly
    await this.institutionsService.updateApplicationStatus(application.id, 'submitted');

    const uploadToken = await this.institutionsService.generateUploadToken(application.id);

    // Send confirmation email to applicant
    try {
      const publicSettings = await this.settingsService.getPublicSettings();
      const supportEmail = publicSettings.supportEmail || 'support@ctsda.org';

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin-bottom: 5px;">Application Submitted Successfully</h2>
            <p style="color: #2563eb; font-weight: bold; margin: 0;">CTSDA Accreditation Review</p>
          </div>
          
          <p>Dear ${body.firstName} ${body.lastName},</p>
          
          <p>Thank you for submitting your accreditation application for <strong>${body.institution.name}</strong> to the Council for Training, Skills & Development America (CTSDA).</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">Next Steps in Review Process:</p>
            <ul style="margin: 10px 0 0 20px; color: #475569; padding: 0;">
              <li>Our accreditation board will review your institution profile and qualification scope.</li>
              <li>You will receive regular progress updates via email as your application moves forward.</li>
              <li>Upon approval, your invoice and accreditation credentials will be issued.</li>
            </ul>
          </div>

          <p>If you have any urgent questions or require assistance during the review process, please reach out directly to our support team at:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="mailto:${supportEmail}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Contact Support (${supportEmail})</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} CTSDA - Council for Training, Skills & Development America. All rights reserved.</p>
        </div>
      `;

      await this.notificationsService.enqueueEmail({
        to: body.email,
        subject: `Application Received - ${body.institution.name}`,
        html: emailHtml,
        userId: 'system',
      });
    } catch (emailErr) {
      console.error('Failed to queue application confirmation email:', emailErr);
    }

    return {
      success: true,
      applicationId: application.id,
      uploadToken,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@CurrentUser() user: any, @Body() body: any) {
    return this.institutionsService.createInstitution({
      ...body,
      createdBy: user.userId,
    });
  }

  @Post('applications')
  @UseGuards(AuthGuard)
  async createApplication(@CurrentUser() user: any, @Body() body: any) {
    return this.institutionsService.createApplication({
      ...body,
      applicantId: user.userId,
    });
  }

  @Get('training-areas')
  async getTrainingAreas() {
    return this.institutionsService.getTrainingAreas();
  }

  @Get('public-accredited')
  async findPublicAccredited() {
    return this.institutionsService.findPublicAccredited();
  }

  @Get()
  async findAll() {
    return this.institutionsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }
}
