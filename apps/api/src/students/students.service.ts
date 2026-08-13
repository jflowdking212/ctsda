import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async listAll() {
    return this.prisma.studentCertificate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async issueManualStudentCertificate(actorId: string, data: any) {
    const studentName = (data.studentName || `${data.firstName || ''} ${data.lastName || ''}`).trim();
    if (!studentName) throw new BadRequestException('Student Name is required');

    const institutionName = (data.institutionName || 'CTSDA Accredited Partner').trim();
    const courseProgram = (data.courseProgram || 'Certified Professional Course').trim();

    const certificateNumber = (data.certificateNumber || `CTSDA-STU-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`).trim();
    const verificationToken = crypto.randomBytes(32).toString('base64url');

    const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
    const expiryDate = (data.doesNotExpire || !data.expiryDate || data.expiryDate === '') 
      ? null 
      : new Date(data.expiryDate);

    const envUrl = process.env.FRONTEND_URL || '';
    const frontendUrl = (!envUrl || envUrl.includes('localhost')) ? 'https://ctsdamerica.com' : envUrl;
    const qrCodeUrl = `${frontendUrl}/verify?token=${verificationToken}`;

    const cert = await this.prisma.studentCertificate.create({
      data: {
        studentName,
        studentEmail: data.studentEmail || data.email || undefined,
        institutionName,
        courseProgram,
        certificateNumber,
        verificationToken,
        issueDate,
        expiryDate,
        status: 'active',
        grade: data.grade || undefined,
        qrCodeUrl,
        createdBy: actorId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action: 'student_certificate_issued',
        entityType: 'student_certificate',
        entityId: cert.id,
        metadata: {
          studentName,
          certificateNumber,
          institutionName,
          courseProgram,
        },
      },
    });

    return cert;
  }

  async findByCertificateNumberOrToken(token: string) {
    if (!token) return null;
    const cleanToken = token.trim();
    return this.prisma.studentCertificate.findFirst({
      where: {
        OR: [
          { certificateNumber: cleanToken },
          { verificationToken: cleanToken },
        ],
      },
    });
  }

  async updateExpiry(id: string, expiresAt?: string | null) {
    const cert = await this.prisma.studentCertificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Student Certificate not found');

    const expiryDate = (!expiresAt || expiresAt === '' || expiresAt === 'none') ? null : new Date(expiresAt);

    return this.prisma.studentCertificate.update({
      where: { id },
      data: { expiryDate },
    });
  }

  async suspend(id: string) {
    const cert = await this.prisma.studentCertificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Student Certificate not found');

    return this.prisma.studentCertificate.update({
      where: { id },
      data: { status: 'suspended' },
    });
  }

  async reactivate(id: string) {
    const cert = await this.prisma.studentCertificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Student Certificate not found');

    return this.prisma.studentCertificate.update({
      where: { id },
      data: { status: 'active' },
    });
  }

  async delete(id: string) {
    const cert = await this.prisma.studentCertificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Student Certificate not found');

    return this.prisma.studentCertificate.delete({ where: { id } });
  }
}
