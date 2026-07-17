import { BadRequestException, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('upload/:applicationId')
  async upload(@CurrentUser() user: any, @Param('applicationId') applicationId: string, @Request() req: any) {
    const multipart = await req.file();
    if (!multipart) throw new BadRequestException('No file provided');

    const buffer = await multipart.toBuffer();
    const file = {
      buffer,
      originalname: multipart.filename,
      size: buffer.length,
    };

    const type = this.documentsService.detectFileType(file);

    const result = await this.documentsService.uploadDocument(user.userId, applicationId, file, type);
    return result;
  }

  @Get(':id/download')
  async getDownloadUrl(@CurrentUser() user: any, @Param('id') id: string) {
    const document = await this.documentsService.findById(id);
    if (!document) throw new BadRequestException('Document not found');
    await this.documentsService.assertCanAccessDocument(user.userId, id);

    const url = await this.documentsService.getSignedUrl(document.storageKey);
    return { url, filename: document.fileName, expiresIn: 3600 };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    const document = await this.documentsService.findById(id);
    if (!document) throw new BadRequestException('Document not found');
    await this.documentsService.assertCanAccessDocument(user.userId, id);

    await this.documentsService.softDelete(id);
    return { success: true };
  }
}
