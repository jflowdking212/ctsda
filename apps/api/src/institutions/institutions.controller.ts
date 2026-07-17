import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('institutions')
export class InstitutionsController {
  constructor(private institutionsService: InstitutionsService) {}

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

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }
}
