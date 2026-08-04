import { Controller, Post, Body, UseGuards, Get, Param, BadRequestException } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('institutions')
export class InstitutionsController {
  constructor(
    private institutionsService: InstitutionsService,
    private authService: AuthService
  ) {}

  @Post('pre-registrations')
  async preRegister(@Body() body: { email: string; institutionId?: string }) {
    const preRegistration = await this.institutionsService.createPreRegistration(body);
    return {
      token: preRegistration.token,
      expiresAt: preRegistration.expiresAt,
      // TODO(M7): send this token by email instead of returning it.
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
    await this.authService.verifyOtp(body.email, body.otp);

    // 2. Create inactive User
    const { user } = await this.authService.registerApplicant({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
    });

    // 3. Create Institution
    const institution = await this.institutionsService.createInstitution({
      ...body.institution,
      createdBy: user.id,
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
      applicantId: user.id,
      ...body.application,
    });

    // 5. Update Application to 'submitted' directly
    await this.institutionsService.updateApplicationStatus(application.id, 'submitted');

    // Generate upload token for logo (we can use the email verification token column temporarily or a JWT, 
    // but for simplicity, since we just created it, we can return a temporary token or use the applicationId itself if we secure the upload endpoint)
    // Actually, we can generate a random token and save it to the application.
    const uploadToken = await this.institutionsService.generateUploadToken(application.id);

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
