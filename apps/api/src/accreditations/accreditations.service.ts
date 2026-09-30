import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import argon2 from 'argon2';

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
    const now = new Date();
    return this.prisma.accreditation.findMany({
      where: {
        status: 'active',
        expiresAt: { gt: now },
        institution: { isActive: true },
      },
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

      // Update institution isActive to false if no other active unexpired accreditations exist
      const otherActive = await tx.accreditation.count({
        where: {
          institutionId: accreditation.institutionId,
          id: { not: id },
          status: 'active',
          expiresAt: { gt: new Date() },
        },
      });

      if (otherActive === 0) {
        await tx.institution.update({
          where: { id: accreditation.institutionId },
          data: { isActive: false },
        });
      }

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

      await tx.institution.update({
        where: { id: accreditation.institutionId },
        data: { isActive: true },
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

  async delete(id: string, actorId: string) {
    await this.assertAccreditationAdmin(actorId);
    const accreditation = await this.prisma.accreditation.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });

    if (!accreditation) {
      throw new NotFoundException('Accreditation not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.certificateStatusHistory.deleteMany({ where: { accreditationId: id } });
      await tx.certificate.deleteMany({ where: { accreditationId: id } });
      await tx.accreditation.delete({ where: { id } });

      const otherActive = await tx.accreditation.count({
        where: {
          institutionId: accreditation.institutionId,
          status: 'active',
          expiresAt: { gt: new Date() },
        },
      });

      if (otherActive === 0) {
        await tx.institution.update({
          where: { id: accreditation.institutionId },
          data: { isActive: false },
        });
      }

      if (accreditation.applicationId) {
        await tx.invoice.deleteMany({ where: { applicationId: accreditation.applicationId } });
        await tx.application.delete({ where: { id: accreditation.applicationId } });
      }

      if (accreditation.application?.applicantId) {
        const applicantId = accreditation.application.applicantId;
        const otherApps = await tx.application.count({ where: { applicantId } });
        if (otherApps === 0) {
          await tx.auditLog.deleteMany({ where: { userId: applicantId } });
          const user = await tx.user.findUnique({ where: { id: applicantId } });
          if (user && user.role === 'applicant') {
            await tx.user.delete({ where: { id: applicantId } });
          }
        }
      }

      const remainingActive = await tx.accreditation.count({
        where: { institutionId: accreditation.institutionId, status: 'active' },
      });
      if (remainingActive === 0) {
        await tx.institution.update({
          where: { id: accreditation.institutionId },
          data: { isActive: false },
        });
      }

      return { success: true };
    });
  }

  async updateExpiry(id: string, actorId: string, expiresAt: string | Date) {
    await this.assertAccreditationAdmin(actorId);
    const newDate = new Date(expiresAt);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.accreditation.update({
        where: { id },
        data: { expiresAt: newDate },
      });

      await tx.certificate.updateMany({
        where: { accreditationId: id },
        data: { expiryDate: newDate },
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
      const tempPasswordHash = await argon2.hash(crypto.randomBytes(16).toString('hex'));
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
      // Check if an institution with this registrationNumber or email already exists
      const searchConditions: any[] = [{ email: data.institutionEmail || targetEmail }];
      if (data.registrationNumber && data.registrationNumber.trim()) {
        searchConditions.push({ registrationNumber: data.registrationNumber.trim() });
      }

      let institution = await tx.institution.findFirst({
        where: { OR: searchConditions },
      });

      if (institution) {
        institution = await tx.institution.update({
          where: { id: institution.id },
          data: {
            name: instName,
            country: data.country || institution.country,
            address: data.address || institution.address,
            phone: data.institutionPhone || data.phone || institution.phone,
            website: data.website || institution.website,
            yearEstablished: data.yearEstablished ? Number(data.yearEstablished) : institution.yearEstablished,
            description: data.description || institution.description,
            logoUrl: uploadedLogoKey || institution.logoUrl,
            isActive: true,
          },
        });
      } else {
        institution = await tx.institution.create({
          data: {
            name: instName,
            slug,
            registrationNumber: data.registrationNumber?.trim() || `RC-${Math.floor(100000 + Math.random() * 900000)}`,
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
            isActive: true,
          },
        });
      }

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
      const envUrl = process.env.FRONTEND_URL || '';
      const frontendUrl = (!envUrl || envUrl.includes('localhost')) ? 'https://ctsdamerica.com' : envUrl;
      const qrCodeUrl = `${frontendUrl}/verify?token=${verificationToken}`;

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

      const inputData = data as any;
      const invoiceAmount = inputData.amount && !isNaN(Number(inputData.amount)) ? Number(inputData.amount) : 1500;
      const invoiceCurrency = (inputData.currency || 'USD').toUpperCase();

      await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          applicationId: application.id,
          amount: invoiceAmount,
          currency: invoiceCurrency,
          status: 'paid',
          description: `CTSDA Institutional Accreditation Fee (${invoiceAmount} ${invoiceCurrency}/year)`,
          dueDate: issuedAt,
          paidAt: issuedAt,
          createdBy: actorId,
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
            amount: invoiceAmount,
            currency: invoiceCurrency,
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

  async updateAccreditation(
    id: string,
    actorId: string,
    data: {
      accreditationCode?: string;
      status?: string;
      issuedAt?: string;
      expiresAt?: string;
      certificateNumber?: string;
      institution?: {
        name?: string;
        registrationNumber?: string;
        institutionType?: string;
        country?: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        yearEstablished?: number | string;
        description?: string;
        logoUrl?: string;
        isActive?: boolean;
      };
    },
  ) {
    await this.assertAccreditationAdmin(actorId);

    const accreditation = await this.prisma.accreditation.findUnique({
      where: { id },
      include: { institution: true, certificates: true },
    });

    if (!accreditation) {
      throw new NotFoundException('Accreditation record not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedAcc = await tx.accreditation.update({
        where: { id },
        data: {
          ...(data.accreditationCode && { accreditationCode: data.accreditationCode }),
          ...(data.status && { status: data.status as any }),
          ...(data.issuedAt && { issuedAt: new Date(data.issuedAt) }),
          ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
        },
      });

      if (accreditation.certificates.length > 0) {
        const cert = accreditation.certificates[0];
        await tx.certificate.update({
          where: { id: cert.id },
          data: {
            ...(data.certificateNumber && { certificateNumber: data.certificateNumber }),
            ...(data.expiresAt && { expiryDate: new Date(data.expiresAt) }),
            ...(data.issuedAt && { issueDate: new Date(data.issuedAt) }),
            ...(data.status && { status: data.status === 'active' ? 'active' : 'suspended' }),
          },
        });
      }

      if (data.institution) {
        const inst = data.institution;
        await tx.institution.update({
          where: { id: accreditation.institutionId },
          data: {
            ...(inst.name && { name: inst.name }),
            ...(inst.registrationNumber !== undefined && { registrationNumber: inst.registrationNumber }),
            ...(inst.institutionType && { institutionType: inst.institutionType }),
            ...(inst.country && { country: inst.country }),
            ...(inst.address && { address: inst.address }),
            ...(inst.phone && { phone: inst.phone }),
            ...(inst.email && { email: inst.email }),
            ...(inst.website !== undefined && { website: inst.website || null }),
            ...(inst.yearEstablished !== undefined && {
              yearEstablished: inst.yearEstablished ? Number(inst.yearEstablished) : null,
            }),
            ...(inst.description !== undefined && { description: inst.description || null }),
            ...(inst.logoUrl !== undefined && { logoUrl: inst.logoUrl || null }),
            ...(inst.isActive !== undefined && { isActive: inst.isActive }),
          },
        });
      }

      if (data.status) {
        const isStatusActive = data.status === 'active';
        await tx.institution.update({
          where: { id: accreditation.institutionId },
          data: { isActive: isStatusActive },
        });
      }

      return tx.accreditation.findUnique({
        where: { id },
        include: { institution: true, certificates: true },
      });
    });
  }
}
