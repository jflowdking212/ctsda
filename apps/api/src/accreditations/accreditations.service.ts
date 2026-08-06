import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class AccreditationsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private notificationsService: NotificationsService,
  ) {}

  async findById(id: string) {
    const accreditation = await this.prisma.accreditation.findUnique({
      where: { id },
      include: { institution: true, certificates: true },
    });

    if (!accreditation) {
      throw new NotFoundException('Accreditation not found');
    }

    return accreditation;
  }

  async listActive() {
    return this.prisma.accreditation.findMany({
      where: { status: 'active' },
      include: { institution: true, certificates: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async listAll() {
    return this.prisma.accreditation.findMany({
      include: { institution: true, certificates: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verifyCertificate(certificateNumber: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        accreditation: {
          include: {
            institution: true,
            application: {
              include: {
                trainingAreas: { include: { trainingArea: true } },
                offeredCertificates: true,
              }
            }
          }
        }
      }
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    // We can record a verification event here if needed
    // await this.prisma.verificationEvent.create({ ... })

    return certificate;
  }

  async suspend(id: string, actorId: string, reason?: string) {
    await this.assertAccreditationAdmin(actorId);
    const accreditation = await this.findById(id);
    if (accreditation.status !== 'active') {
      throw new BadRequestException('Only active accreditations can be suspended');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.accreditation.update({
        where: { id },
        data: { status: 'suspended', suspendedAt: new Date() },
      });

      await tx.certificate.updateMany({
        where: { accreditationId: id },
        data: { status: 'suspended' },
      });

      await tx.certificateStatusHistory.create({
        data: {
          accreditationId: id,
          fromStatus: 'active',
          toStatus: 'suspended',
          changedBy: actorId,
          reason,
        },
      });

      return updated;
    });
  }

  async reactivate(id: string, actorId: string, reason?: string) {
    await this.assertAccreditationAdmin(actorId);
    const accreditation = await this.findById(id);
    if (accreditation.status !== 'suspended') {
      throw new BadRequestException('Only suspended accreditations can be reactivated');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.accreditation.update({
        where: { id },
        data: { status: 'active', suspendedAt: null },
      });

      await tx.certificate.updateMany({
        where: { accreditationId: id },
        data: { status: 'active' },
      });

      await tx.certificateStatusHistory.create({
        data: {
          accreditationId: id,
          fromStatus: 'suspended',
          toStatus: 'active',
          changedBy: actorId,
          reason,
        },
      });

      return updated;
    });
  }

  private async assertAccreditationAdmin(actorId: string) {
    const actor = await this.prisma.user.findUnique({ where: { id: actorId } });
    if (!['super_admin', 'support_officer'].includes(actor?.role || '')) {
      throw new ForbiddenException('Only admins can manage accreditation status');
    }
  }

  async uploadCertificate(id: string, actorId: string, file: any) {
    await this.assertAccreditationAdmin(actorId);
    
    const accreditation = await this.findById(id);
    const existingCertificate = accreditation.certificates.find(c => c.status === 'active');
    
    if (!existingCertificate) {
      throw new BadRequestException('No active certificate found for this accreditation');
    }

    const key = this.storageService.generateStorageKey(file);
    const result = await this.storageService.upload(file, key, file.mimetype || 'application/pdf');

    return this.prisma.certificate.update({
      where: { id: existingCertificate.id },
      data: { pdfUrl: result.key },
    });
  }

  async uploadLogoFile(file: any, mimeType?: string) {
    const key = this.storageService.generateStorageKey(file);
    const result = await this.storageService.upload(file, key, mimeType || 'image/png');
    const url = await this.storageService.getSignedUrl(result.key);
    return { key: result.key, url };
  }

  async issueManualAccreditation(
    actorId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      applicantEmail?: string;
      phone?: string;
      applicantPhone?: string;

      institutionName?: string;
      name?: string;
      registrationNumber?: string;
      institutionType?: string;
      country?: string;
      address?: string;
      institutionPhone?: string;
      institutionEmail?: string;
      website?: string;
      yearEstablished?: number | string;
      description?: string;
      logoUrl?: string;

      trainingAreaIds?: string[];
      certificatesOffered?: string[] | string;
      deliveryMethods?: string[] | string;
      staffingCount?: number | string;
      operationalInfo?: string;

      accreditationCode?: string;
      certificateNumber?: string;
      issuedAt?: string;
      expiresAt?: string;
    },
    logoFile?: any,
  ) {
    await this.assertAccreditationAdmin(actorId);

    const instName = (data.institutionName || data.name || '').trim();
    if (!instName) {
      throw new BadRequestException('Institution / Company Name is required.');
    }

    const targetEmail = (data.applicantEmail || data.email || data.institutionEmail || '').trim().toLowerCase();
    if (!targetEmail) {
      throw new BadRequestException('An official email address is required to create an account and issue accreditation.');
    }

    // Handle logo file upload if provided
    let uploadedLogoKey = data.logoUrl || null;
    if (logoFile) {
      const key = this.storageService.generateStorageKey(logoFile);
      const result = await this.storageService.upload(logoFile, key, logoFile.mimetype || 'image/png');
      uploadedLogoKey = result.key;
    }

    // Find or create User
    let user = await this.prisma.user.findUnique({ where: { email: targetEmail } });
    let accountSetupToken: string | null = null;
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const bcrypt = require('bcryptjs');
      const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      accountSetupToken = crypto.randomBytes(32).toString('base64url');

      user = await this.prisma.user.create({
        data: {
          email: targetEmail,
          passwordHash: tempPasswordHash,
          firstName: data.firstName || 'Director',
          lastName: data.lastName || 'Admin',
          phone: data.applicantPhone || data.phone || data.institutionPhone || undefined,
          role: 'applicant',
          isActive: true,
          emailVerificationToken: accountSetupToken,
        },
      });
    }

    const now = new Date();
    const issuedAt = data.issuedAt ? new Date(data.issuedAt) : now;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const baseSlug = instName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const certsOffered = Array.isArray(data.certificatesOffered)
      ? data.certificatesOffered
      : typeof data.certificatesOffered === 'string'
      ? data.certificatesOffered.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const deliveryMeths = Array.isArray(data.deliveryMethods)
      ? data.deliveryMethods
      : typeof data.deliveryMethods === 'string'
      ? data.deliveryMethods.split(',').map(s => s.trim()).filter(Boolean)
      : ['Online Live', 'In-Person'];

    const staffingNum = data.staffingCount ? Number(data.staffingCount) : undefined;

    const accreditationCode = data.accreditationCode || `CTSDA-${now.getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const certificateNumber = data.certificateNumber || `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    return this.prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: instName,
          slug,
          registrationNumber: data.registrationNumber || `RC-${Math.floor(100000 + Math.random() * 900000)}`,
          institutionType: data.institutionType || 'corporate',
          country: data.country || 'United States',
          address: data.address || 'N/A',
          phone: data.institutionPhone || data.phone || 'N/A',
          email: data.institutionEmail || targetEmail,
          website: data.website || undefined,
          yearEstablished: data.yearEstablished ? Number(data.yearEstablished) : undefined,
          description: data.description || undefined,
          logoUrl: uploadedLogoKey || undefined,
          createdBy: actorId,
        },
      });

      // Filter and resolve training area IDs if passed
      let validTrainingAreaIds: string[] = [];
      if (data.trainingAreaIds && data.trainingAreaIds.length > 0) {
        const existingAreas = await tx.trainingArea.findMany({
          where: {
            OR: [
              { id: { in: data.trainingAreaIds.filter((id) => /^[0-9a-fA-F-]{36}$/.test(id)) } },
              { code: { in: data.trainingAreaIds } },
            ],
          },
          select: { id: true },
        });
        validTrainingAreaIds = existingAreas.map((a) => a.id);
      }

      const application = await tx.application.create({
        data: {
          institutionId: institution.id,
          applicantId: user.id,
          status: 'approved',
          submittedAt: issuedAt,
          reviewedAt: issuedAt,
          reviewedBy: actorId,
          reviewerNotes: 'Manually issued accreditation record by system administrator.',
          certificatesOffered: certsOffered,
          deliveryMethods: deliveryMeths,
          staffingCount: staffingNum,
          operationalInfo: data.operationalInfo || undefined,
          trainingAreas: validTrainingAreaIds.length
            ? { create: validTrainingAreaIds.map((trainingAreaId) => ({ trainingAreaId })) }
            : undefined,
          offeredCertificates: certsOffered.length
            ? { create: certsOffered.map((name) => ({ name })) }
            : undefined,
          deliveryMethodRecords: deliveryMeths.length
            ? { create: deliveryMeths.map((name) => ({ name })) }
            : undefined,
        },
      });

      const accreditation = await tx.accreditation.create({
        data: {
          institutionId: institution.id,
          applicationId: application.id,
          accreditationCode,
          status: 'active',
          issuedAt,
          expiresAt,
        },
      });

      const verificationToken = crypto.randomBytes(32).toString('base64url');
      const frontendUrl = process.env.FRONTEND_URL || 'https://ctsda.acecoterieconsulting.com';
      const qrCodeUrl = await QRCode.toDataURL(`${frontendUrl}/verify?token=${verificationToken}`);

      const certificate = await tx.certificate.create({
        data: {
          accreditationId: accreditation.id,
          certificateNumber,
          verificationToken,
          issueDate: issuedAt,
          expiryDate: expiresAt,
          status: 'active',
          qrCodeUrl,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: actorId,
          action: 'manual_accreditation_issued',
          entityType: 'accreditation',
          entityId: accreditation.id,
          metadata: {
            accreditationCode,
            certificateNumber,
            institutionId: institution.id,
            targetEmail,
            isNewUser,
          },
        },
      });

      // Send Account Activation / Setup Email to user if new account or setup token available
      const tokenToUse = accountSetupToken || user.emailVerificationToken;
      if (tokenToUse) {
        const setupLink = `${frontendUrl}/setup-account?token=${tokenToUse}`;
        await this.notificationsService.enqueueEmail({
          to: targetEmail,
          subject: 'Welcome to CTSDA - Your Accreditation Account is Ready',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0;">CTSDA Institutional Accreditation Issued</h2>
              <p>Dear ${user.firstName || 'Institution Administrator'},</p>
              <p>We are pleased to inform you that <strong>${instName}</strong> has been officially granted CTSDA Accreditation!</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 16px 0;">
                <p style="margin: 0; font-weight: bold; color: #1e3a8a;">Accreditation Code: ${accreditationCode}</p>
                <p style="margin: 4px 0 0 0; color: #475569;">Certificate Number: ${certificateNumber}</p>
              </div>
              <p>An account has been prepared for you. Please click the button below to set up your password and access your verified digital portal:</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${setupLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">Set Up Account &amp; Access Portal</a>
              </div>
              <p style="font-size: 0.85rem; color: #64748b;">If the button above does not work, copy and paste this URL into your web browser:<br/><a href="${setupLink}">${setupLink}</a></p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 0.8rem; color: #94a3b8; text-align: center;">Council for Training Skills &amp; Development America (CTSDA)</p>
            </div>
          `,
          userId: user.id,
        });
      }

      return {
        success: true,
        accreditation,
        institution,
        certificate,
        application,
        user,
        accountSetupSent: !!tokenToUse,
      };
    });
  }
}
