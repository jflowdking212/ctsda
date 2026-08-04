import { Body, Controller, Get, Param, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AccreditationsService } from './accreditations.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('accreditations')
export class AccreditationsController {
  constructor(private accreditationsService: AccreditationsService) {}

  @Post(':id/upload-certificate')
  @UseGuards(AuthGuard)
  async uploadCertificate(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Request() req: any
  ) {
    const multipart = await req.file();
    if (!multipart) throw new BadRequestException('No file provided');

    const buffer = await multipart.toBuffer();
    const file = {
      buffer,
      originalname: multipart.filename,
      size: buffer.length,
      mimetype: multipart.mimetype,
    };

    return this.accreditationsService.uploadCertificate(id, user.userId, file);
  }

  @Get()
  async listActive() {
    return this.accreditationsService.listActive();
  }

  @Get('verify/:certificateNumber')
  async verifyCertificate(@Param('certificateNumber') certificateNumber: string) {
    return this.accreditationsService.verifyCertificate(certificateNumber);
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
