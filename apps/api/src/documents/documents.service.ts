import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { StorageService, StoredFile } from '../storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService, private storageService: StorageService) {}

  async uploadDocument(userId: string, applicationId: string, file: StoredFile, type: { mime: string; ext: string }) {
    await this.assertCanAccessApplication(userId, applicationId);
    await this.assertDocumentLimit(applicationId);
    await this.scanForMalware(file.buffer, file.originalname);

    const existing = await this.prisma.applicationDocument.findFirst({
      where: { applicationId, documentType: DocumentType.other, status: { not: 'rejected' } },
      orderBy: { version: 'desc' },
    });

    if (existing) {
      const nextVersion = existing.version + 1;
      const key = this.storageService.generateStorageKey({
        buffer: file.buffer,
        originalname: `${nextVersion}-${file.originalname}`,
        size: file.size,
      } as any);
      const result = await this.storageService.upload({ buffer: file.buffer, originalname: file.originalname, size: file.size }, key, type.mime);

      return this.prisma.applicationDocument.create({
        data: {
          applicationId,
          uploaderId: userId,
          documentType: DocumentType.other,
          storageKey: result.key,
          fileName: file.originalname,
          mimeType: type.mime,
          fileSize: result.size,
          version: nextVersion,
          status: 'pending',
        },
      });
    }

    const key = this.storageService.generateStorageKey(file);
    const result = await this.storageService.upload(file, key, type.mime);

    return this.prisma.applicationDocument.create({
      data: {
        applicationId,
        uploaderId: userId,
        documentType: DocumentType.other,
        storageKey: result.key,
        fileName: file.originalname,
        mimeType: type.mime,
        fileSize: result.size,
        version: 1,
        status: 'pending',
      },
    });
  }

  async publicUploadDocument(applicationId: string, token: string, file: StoredFile, type: { mime: string; ext: string }) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true },
    });

    if (!application || (application.applicant?.emailVerificationToken || application.paymentToken) !== token) {
      throw new ForbiddenException('Invalid upload token');
    }

    await this.scanForMalware(file.buffer, file.originalname);

    const key = this.storageService.generateStorageKey(file);
    const result = await this.storageService.upload(file, key, type.mime);

    // Also update the institution's logo URL if it is an image
    if (type.mime.startsWith('image/')) {
      await this.prisma.institution.update({
        where: { id: application.institutionId },
        data: { logoUrl: result.key },
      });
    }

    return this.prisma.applicationDocument.create({
      data: {
        applicationId,
        uploaderId: (application.applicantId || ''),
        documentType: DocumentType.other,
        storageKey: result.key,
        fileName: file.originalname,
        mimeType: type.mime,
        fileSize: result.size,
        version: 1,
        status: 'pending',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.applicationDocument.findUnique({ where: { id } });
  }

  async assertCanAccessDocument(userId: string, documentId: string) {
    const document = await this.prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: { application: true },
    });
    if (!document) {
      throw new BadRequestException('Document not found');
    }

    await this.assertCanAccessApplication(userId, document.applicationId);
  }

  async assertCanAccessApplication(userId: string, applicationId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new BadRequestException('Application not found');
    }

    const adminRoles = ['super_admin', 'reviewer', 'support_officer', 'auditor'];
    if ((application.applicantId || '') !== userId && !adminRoles.includes(user?.role || '')) {
      throw new ForbiddenException('You cannot access this application document');
    }
  }

  async assertDocumentLimit(applicationId: string) {
    const maxDocuments = Number(process.env.MAX_DOCUMENTS_PER_APPLICATION || 20);
    const count = await this.prisma.applicationDocument.count({
      where: { applicationId, status: { not: 'rejected' } },
    });
    if (count >= maxDocuments) {
      throw new BadRequestException(`Document limit of ${maxDocuments} reached`);
    }
  }

  async getSignedUrl(storageKey: string) {
    return this.storageService.getSignedUrl(storageKey);
  }

  async softDelete(id: string) {
    await this.prisma.applicationDocument.update({ where: { id }, data: { status: 'rejected' } });
  }

  detectFileType(file: StoredFile): { mime: string; ext: string } {
    const bytes = file.buffer;
    const isPdf = bytes.subarray(0, 4).toString() === '%PDF';
    const isPng = bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isZipBasedDocx = bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;

    if (isPdf) return { ext: 'pdf', mime: 'application/pdf' };
    if (isPng) return { ext: 'png', mime: 'image/png' };
    if (isJpeg) return { ext: 'jpg', mime: 'image/jpeg' };
    if (isZipBasedDocx && file.originalname.toLowerCase().endsWith('.docx')) {
      return { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
    }

    throw new BadRequestException('Unsupported or mismatched file type');
  }

  private async scanForMalware(_buffer: Buffer, _filename: string): Promise<void> {
    // Stub interface: replace with ClamAV or a malware-scan API call later.
    // Returning here means the file is treated as clean. Throw to reject.
    return Promise.resolve();
  }
}
