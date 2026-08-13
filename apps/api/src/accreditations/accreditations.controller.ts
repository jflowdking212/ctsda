import { Body, Controller, Get, Param, Post, Query, Res, UseGuards, Request, BadRequestException, NotFoundException } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AccreditationsService } from './accreditations.service';
import { StorageService } from '../storage/storage.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('accreditations')
export class AccreditationsController {
  constructor(
    private accreditationsService: AccreditationsService,
    private storageService: StorageService,
  ) {}

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

  @Post(':id/certificate/upload')
  @UseGuards(AuthGuard)
  async uploadCertificateAlias(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Request() req: any
  ) {
    return this.uploadCertificate(user, id, req);
  }

  @Get()
  async listActive() {
    return this.accreditationsService.listActive();
  }

  @Get('all')
  @UseGuards(AuthGuard)
  async listAll() {
    return this.accreditationsService.listAll();
  }

  @Post('manual')
  @UseGuards(AuthGuard)
  async issueManual(
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    return this.accreditationsService.issueManualAccreditation(user.userId, body);
  }

  @Post('upload-logo')
  @UseGuards(AuthGuard)
  async uploadLogo(
    @CurrentUser() user: any,
    @Request() req: any,
  ) {
    const multipart = await req.file();
    if (!multipart) throw new BadRequestException('No image file provided');

    const buffer = await multipart.toBuffer();
    const file = {
      buffer,
      originalname: multipart.filename,
      size: buffer.length,
    };

    return this.accreditationsService.uploadLogoFile(file, multipart.mimetype);
  }

  @Get('logo-file')
  async getLogoFile(@Query('key') key: string, @Res() res: FastifyReply) {
    if (!key) throw new BadRequestException('Missing image file key');
    try {
      const { stream, contentType } = await this.storageService.getObjectStream(key);
      res.type(contentType);
      return res.send(stream);
    } catch {
      throw new NotFoundException('Logo image not found');
    }
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

  @Post(':id/delete')
  @UseGuards(AuthGuard)
  async delete(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.accreditationsService.delete(id, user.userId);
  }

  @Post(':id/update-expiry')
  @UseGuards(AuthGuard)
  async updateExpiry(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { expiresAt: string },
  ) {
    return this.accreditationsService.updateExpiry(id, user.userId, body.expiresAt);
  }

  @Post(':id/update')
  @UseGuards(AuthGuard)
  async updateAccreditation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.accreditationsService.updateAccreditation(id, user.userId, body);
  }
}
