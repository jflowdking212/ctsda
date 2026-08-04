import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import { AccreditationsService } from '../accreditations/accreditations.service';

const ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'reviewer',
  'finance_officer',
  'support_officer',
  'content_manager',
  'auditor',
];

const APPLICATION_MANAGERS: UserRole[] = ['super_admin', 'reviewer', 'support_officer'];
const INSTITUTION_MANAGERS: UserRole[] = ['super_admin', 'support_officer', 'content_manager'];
const USER_MANAGERS: UserRole[] = ['super_admin'];
const EXPORT_ROLES: UserRole[] = ['super_admin', 'support_officer', 'auditor'];
const REPORT_ROLES: UserRole[] = ['super_admin', 'reviewer', 'finance_officer', 'support_officer', 'auditor'];
const MANUAL_PAYMENT_ROLES: UserRole[] = ['super_admin', 'finance_officer'];
const APPLICATION_FEE_AMOUNT = 50000;

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private reviewsService: ReviewsService,
    private accreditationsService: AccreditationsService,
  ) {}

  async getAdminProfile(userId: string) {
    const user = await this.requireRole(userId, ADMIN_ROLES);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isTotpEnabled: user.isTotpEnabled,
    };
  }

  async listApplications(actorId: string, filters: { status?: ApplicationStatus; reviewerId?: string; from?: string; to?: string }) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);

    return this.prisma.application.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.reviewerId && { reviewedBy: filters.reviewerId }),
        ...((filters.from || filters.to) && {
          createdAt: {
            ...(filters.from && { gte: new Date(filters.from) }),
            ...(filters.to && { lte: new Date(filters.to) }),
          },
        }),
      },
      include: {
        institution: { select: { id: true, name: true, country: true, logoUrl: true } },
        applicant: { select: { id: true, email: true, firstName: true, lastName: true } },
        reviewer: { select: { id: true, email: true, firstName: true, lastName: true } },
        checklistItems: true,
        comments: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async getApplication(actorId: string, id: string) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        institution: true,
        applicant: { select: { id: true, email: true, firstName: true, lastName: true } },
        reviewer: { select: { id: true, email: true, firstName: true, lastName: true } },
        documents: true,
        checklistItems: { orderBy: { createdAt: 'asc' } },
        comments: {
          include: { author: { select: { id: true, email: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        invoices: true,
        accreditations: { include: { certificates: true } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async transitionApplication(actorId: string, id: string, status: ApplicationStatus, metadata?: Record<string, any>) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.reviewsService.transitionStatus(id, status, actorId, metadata);
  }

  async assignReviewer(actorId: string, id: string, reviewerId: string) {
    await this.requireRole(actorId, ['super_admin', 'support_officer']);
    return this.reviewsService.assignReviewer(id, reviewerId, actorId);
  }

  async addComment(actorId: string, id: string, content: string, isInternal = true) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.reviewsService.addComment(id, actorId, content, isInternal);
  }

  async createChecklistItem(actorId: string, id: string, label: string) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.reviewsService.createChecklistItem(id, actorId, label);
  }

  async setChecklistItem(actorId: string, itemId: string, isCompleted: boolean) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.reviewsService.setChecklistItemCompleted(itemId, actorId, isCompleted);
  }

  async updateReviewerNotes(actorId: string, id: string, notes: string) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.prisma.application.update({
      where: { id },
      data: { reviewerNotes: notes },
    });
  }

  async recordManualPayment(
    actorId: string,
    applicationId: string,
    data: { amount?: number; currency?: string; reference?: string; notes?: string },
  ) {
    const actor = await this.requireRole(actorId, MANUAL_PAYMENT_ROLES);
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { invoices: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const amount = data.amount ?? Number(application.invoices[0]?.amount || APPLICATION_FEE_AMOUNT);
    const currency = (data.currency || application.invoices[0]?.currency || 'USD').toUpperCase();
    const reference = data.reference?.trim() || `manual:${applicationId}:${Date.now()}`;
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const invoice = application.invoices[0]
        ? await tx.invoice.update({
            where: { id: application.invoices[0].id },
            data: { status: 'paid', paidAt: now },
          })
        : await tx.invoice.create({
            data: {
              invoiceNumber: this.generateInvoiceNumber(),
              applicationId,
              amount,
              currency,
              status: 'paid',
              description: 'Manual CTSDA accreditation application fee',
              dueDate: now,
              paidAt: now,
              createdBy: actorId,
            },
          });

      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount,
          currency,
          provider: 'manual',
          providerPaymentId: reference,
          providerEventId: reference,
          idempotencyKey: `manual:${invoice.id}:${reference}`,
          processedBy: actorId,
          status: 'completed',
          metadata: {
            notes: data.notes,
            source: 'admin_manual_payment',
          },
        },
      });

      if (application.status === 'payment_pending') {
        await tx.application.update({
          where: { id: applicationId },
          data: { status: 'under_review' },
        });
        await tx.applicationStatusHistory.create({
          data: {
            applicationId,
            fromStatus: 'payment_pending',
            toStatus: 'under_review',
            changedBy: actorId,
            reason: 'Manual payment recorded',
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: actor.id,
          action: 'payment_processed',
          entityType: 'payment',
          entityId: payment.id,
          metadata: {
            applicationId,
            invoiceId: invoice.id,
            amount,
            currency,
            provider: 'manual',
            reference,
          },
        },
      });

      return { success: true, invoice, payment };
    });
  }

  async listInstitutions(actorId: string) {
    await this.requireRole(actorId, INSTITUTION_MANAGERS);
    return this.prisma.institution.findMany({
      include: { accreditations: true },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }

  async updateInstitution(actorId: string, id: string, data: { name?: string; website?: string; logoUrl?: string; description?: string; isActive?: boolean }) {
    await this.requireRole(actorId, INSTITUTION_MANAGERS);
    return this.prisma.institution.update({
      where: { id },
      data,
    });
  }

  async exportInstitutionsCsv(actorId: string) {
    const actor = await this.requireRole(actorId, EXPORT_ROLES);
    const institutions = await this.prisma.institution.findMany({
      include: { accreditations: true },
      orderBy: { name: 'asc' },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: 'export_performed',
        entityType: 'institution',
        metadata: { format: 'csv', rows: institutions.length },
      },
    });

    const rows = institutions.map((institution) => [
      institution.name,
      institution.registrationNumber,
      institution.country,
      institution.email,
      institution.website || '',
      institution.accreditations.map((accreditation) => accreditation.accreditationCode).join('; '),
      institution.isActive ? 'active' : 'inactive',
    ]);

    return this.toCsv([
      ['Name', 'Registration Number', 'Country', 'Email', 'Website', 'Accreditation Codes', 'Status'],
      ...rows,
    ]);
  }

  async suspendAccreditation(actorId: string, id: string, reason?: string) {
    await this.requireRole(actorId, ['super_admin', 'support_officer']);
    return this.accreditationsService.suspend(id, actorId, reason);
  }

  async reactivateAccreditation(actorId: string, id: string, reason?: string) {
    await this.requireRole(actorId, ['super_admin', 'support_officer']);
    return this.accreditationsService.reactivate(id, actorId, reason);
  }

  async listUsers(actorId: string) {
    await this.requireRole(actorId, USER_MANAGERS);
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isTotpEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async updateUser(actorId: string, id: string, data: { role?: UserRole; isActive?: boolean }) {
    await this.requireRole(actorId, USER_MANAGERS);
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  async createAdminUser(
    actorId: string,
    data: { email: string; firstName: string; lastName: string; role: UserRole; phone?: string },
  ) {
    const actor = await this.requireRole(actorId, USER_MANAGERS);
    if (!ADMIN_ROLES.includes(data.role) || data.role === 'applicant') {
      throw new BadRequestException('Only administrative roles can be created here');
    }

    const passwordResetToken = randomBytes(32).toString('base64url');
    const temporaryPassword = randomBytes(18).toString('base64url');
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        passwordHash: await argon2.hash(temporaryPassword),
        isEmailVerified: true,
        forcePasswordReset: true,
        passwordResetToken,
        passwordResetExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        forcePasswordReset: true,
        isTotpEnabled: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: 'user_created',
        entityType: 'user',
        entityId: user.id,
        metadata: { role: data.role, forcePasswordReset: true, totpEnrollmentRequired: true },
      },
    });

    return { user, passwordResetToken };
  }

  async createLegacyAccreditedInstitution(
    actorId: string,
    data: {
      name: string;
      registrationNumber: string;
      institutionType: string;
      country: string;
      address: string;
      phone: string;
      email: string;
      website?: string;
      description?: string;
      accreditationCode: string;
      certificateNumber: string;
      verificationToken?: string;
      issuedAt?: string;
      expiresAt?: string;
    },
  ) {
    const actor = await this.requireRole(actorId, ['super_admin', 'support_officer']);
    const now = new Date();
    const issuedAt = data.issuedAt ? new Date(data.issuedAt) : now;
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return this.prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: data.name,
          slug,
          registrationNumber: data.registrationNumber,
          institutionType: data.institutionType,
          country: data.country,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          description: data.description,
          createdBy: actorId,
        },
      });

      const application = await tx.application.create({
        data: {
          institutionId: institution.id,
          applicantId: actorId,
          status: 'approved',
          submittedAt: issuedAt,
          reviewedAt: issuedAt,
          reviewedBy: actorId,
          reviewerNotes: 'Manually entered reviewed legacy accredited institution.',
        },
      });

      const accreditation = await tx.accreditation.create({
        data: {
          institutionId: institution.id,
          applicationId: application.id,
          accreditationCode: data.accreditationCode,
          status: 'active',
          issuedAt,
          expiresAt,
        },
      });

      const certificate = await tx.certificate.create({
        data: {
          accreditationId: accreditation.id,
          certificateNumber: data.certificateNumber,
          verificationToken: data.verificationToken || randomBytes(32).toString('base64url'),
          issueDate: issuedAt,
          expiryDate: expiresAt,
          status: 'active',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: actor.id,
          action: 'legacy_institution_seeded',
          entityType: 'institution',
          entityId: institution.id,
          metadata: {
            accreditationCode: data.accreditationCode,
            certificateNumber: data.certificateNumber,
            manualReview: true,
          },
        },
      });

      return { institution, application, accreditation, certificate };
    });
  }

  async changePassword(actorId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: actorId } });
    if (!user || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw new BadRequestException('Current password is incorrect');
    }

    await this.prisma.user.update({
      where: { id: actorId },
      data: { passwordHash: await argon2.hash(newPassword) },
    });

    return { success: true };
  }

  async listAuditLogs(actorId: string) {
    await this.requireRole(actorId, ['auditor', 'super_admin']);
    return this.prisma.auditLog.findMany({
      include: { user: { select: { email: true, firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async getReportSummary(actorId: string) {
    await this.requireRole(actorId, REPORT_ROLES);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const [
      totalApplications,
      pendingApplications,
      approvedApplicationsCount,
      newApplications,
      applicationsByStatus,
      decisionsByStatus,
      averageReviewTimeRows,
      activeAccreditations,
      expiringAccreditations,
      countriesRepresented,
      popularTrainingAreaCounts,
      reviewerWorkloadCounts,
      invoiceStatus,
      revenue,
      totalTrainings,
      totalEnrollments,
      totalBlogPosts,
    ] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.application.count({
        where: { status: { in: ['submitted', 'resubmitted', 'under_review', 'final_review', 'initial_screening'] } },
      }),
      this.prisma.application.count({ where: { status: 'approved' } }),
      this.prisma.application.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.application.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { status: { in: ['approved', 'rejected'] } },
        _count: { _all: true },
      }),
      this.prisma.$queryRaw<Array<{ averageDays: number | null }>>`
        SELECT COALESCE(AVG(EXTRACT(EPOCH FROM ("reviewedAt" - "submittedAt")) / 86400), 0)::float AS "averageDays"
        FROM "applications"
        WHERE "submittedAt" IS NOT NULL AND "reviewedAt" IS NOT NULL
      `,
      this.prisma.accreditation.count({ where: { status: 'active' } }),
      this.prisma.accreditation.count({
        where: { status: 'active', expiresAt: { lte: ninetyDaysFromNow } },
      }),
      this.prisma.institution.groupBy({
        by: ['country'],
        _count: { _all: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10,
      }),
      this.prisma.applicationTrainingArea.groupBy({
        by: ['trainingAreaId'],
        _count: { applicationId: true },
        orderBy: { _count: { applicationId: 'desc' } },
        take: 10,
      }),
      this.prisma.application.groupBy({
        by: ['reviewedBy'],
        where: {
          reviewedBy: { not: null },
          status: { in: ['submitted', 'under_review', 'resubmitted', 'final_review'] },
        },
        _count: { _all: true },
        orderBy: { _count: { reviewedBy: 'desc' } },
        take: 10,
      }),
      this.prisma.invoice.groupBy({
        by: ['status', 'currency'],
        _count: { _all: true },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.training.count(),
      this.prisma.trainingEnrollment.count(),
      this.prisma.blogPost.count(),
    ]);

    const trainingAreaIds = popularTrainingAreaCounts.map((item) => item.trainingAreaId);
    const reviewerIds = reviewerWorkloadCounts
      .map((item) => item.reviewedBy)
      .filter((id): id is string => Boolean(id));

    const [trainingAreas, reviewers] = await Promise.all([
      trainingAreaIds.length
        ? this.prisma.trainingArea.findMany({
            where: { id: { in: trainingAreaIds } },
            select: { id: true, name: true, code: true },
          })
        : [],
      reviewerIds.length
        ? this.prisma.user.findMany({
            where: { id: { in: reviewerIds } },
            select: { id: true, email: true, firstName: true, lastName: true },
          })
        : [],
    ]);

    const approved = decisionsByStatus.find((item) => item.status === 'approved')?._count._all || 0;
    const rejected = decisionsByStatus.find((item) => item.status === 'rejected')?._count._all || 0;
    const totalDecisions = approved + rejected;
    const trainingAreaMap = new Map(trainingAreas.map((area) => [area.id, area]));
    const reviewerMap = new Map(reviewers.map((reviewer) => [reviewer.id, reviewer]));

    return {
      generatedAt: now.toISOString(),
      pipeline: {
        totalApplications,
        pendingApplications,
        approvedApplications: approvedApplicationsCount,
        newApplications30d: newApplications,
        applicationsByStatus: applicationsByStatus.map((item) => ({
          status: item.status,
          count: item._count._all,
        })),
        averageReviewDays: Number((averageReviewTimeRows[0]?.averageDays || 0).toFixed(2)),
        approvalRate: totalDecisions ? Number((approved / totalDecisions).toFixed(4)) : 0,
        rejectionRate: totalDecisions ? Number((rejected / totalDecisions).toFixed(4)) : 0,
      },
      accreditations: {
        active: activeAccreditations,
        expiringIn90Days: expiringAccreditations,
      },
      institutions: {
        countriesRepresented: countriesRepresented.map((item) => ({
          country: item.country,
          count: item._count._all,
        })),
      },
      trainingAreas: popularTrainingAreaCounts.map((item) => {
        const trainingArea = trainingAreaMap.get(item.trainingAreaId);
        return {
          id: item.trainingAreaId,
          name: trainingArea?.name || 'Unknown training area',
          code: trainingArea?.code || null,
          applications: item._count.applicationId,
        };
      }),
      reviewers: reviewerWorkloadCounts.map((item) => {
        const reviewer = item.reviewedBy ? reviewerMap.get(item.reviewedBy) : undefined;
        return {
          id: item.reviewedBy,
          name: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'Unassigned',
          email: reviewer?.email || null,
          openReviews: item._count._all,
        };
      }),
      revenue: {
        completedPayments: revenue._count._all,
        completedAmount: Number(revenue._sum.amount || 0),
        invoicesByStatus: invoiceStatus.map((item) => ({
          status: item.status,
          currency: item.currency,
          count: item._count._all,
          amount: Number(item._sum.amount || 0),
        })),
      },
      content: {
        totalTrainings,
        totalEnrollments,
        totalBlogPosts,
        popularTrainings: (await this.prisma.training.findMany({
          orderBy: { enrollments: { _count: 'desc' } },
          include: { _count: { select: { enrollments: true } } },
          take: 5,
        })).map((t) => ({ title: t.title, enrollments: t._count.enrollments })),
        recentBlogPosts: (await this.prisma.blogPost.findMany({
          orderBy: { publishedAt: 'desc' },
          where: { isPublished: true },
          take: 5,
        })).map((p) => ({ title: p.title, publishedAt: p.publishedAt })),
      },
    };
  }

  async exportReportCsv(actorId: string) {
    const actor = await this.requireRole(actorId, EXPORT_ROLES);
    const summary = await this.getReportSummary(actorId);

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: 'export_performed',
        entityType: 'report',
        metadata: { format: 'csv', report: 'board_summary' },
      },
    });

    return this.toCsv([
      ['Metric', 'Value'],
      ['Generated At', summary.generatedAt],
      ['Total Applications', summary.pipeline.totalApplications],
      ['New Applications 30d', summary.pipeline.newApplications30d],
      ['Average Review Days', summary.pipeline.averageReviewDays],
      ['Approval Rate', summary.pipeline.approvalRate],
      ['Rejection Rate', summary.pipeline.rejectionRate],
      ['Active Accreditations', summary.accreditations.active],
      ['Expiring Accreditations 90d', summary.accreditations.expiringIn90Days],
      ['Completed Payment Amount', summary.revenue.completedAmount],
      ['Completed Payment Count', summary.revenue.completedPayments],
    ]);
  }

  async exportReportPdf(actorId: string) {
    const actor = await this.requireRole(actorId, EXPORT_ROLES);
    const summary = await this.getReportSummary(actorId);

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: 'export_performed',
        entityType: 'report',
        metadata: { format: 'pdf', report: 'board_summary' },
      },
    });

    const lines = [
      'CTSDA Board Reporting Summary',
      `Generated: ${summary.generatedAt}`,
      `Total applications: ${summary.pipeline.totalApplications}`,
      `New applications 30d: ${summary.pipeline.newApplications30d}`,
      `Average review days: ${summary.pipeline.averageReviewDays}`,
      `Approval rate: ${(summary.pipeline.approvalRate * 100).toFixed(1)}%`,
      `Rejection rate: ${(summary.pipeline.rejectionRate * 100).toFixed(1)}%`,
      `Active accreditations: ${summary.accreditations.active}`,
      `Expiring in 90 days: ${summary.accreditations.expiringIn90Days}`,
      `Completed revenue: ${summary.revenue.completedAmount}`,
    ];

    return this.createSimplePdf(lines);
  }

  private async requireRole(userId: string, allowedRoles: UserRole[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new ForbiddenException('User is not active');
    }
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return user;
  }

  private toCsv(rows: Array<Array<string | number | boolean>>) {
    return rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? '');
            return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(','),
      )
      .join('\n');
  }

  private generateInvoiceNumber(): string {
    return `INV-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  private createSimplePdf(lines: string[]) {
    const escapedLines = lines.map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'));
    const textOperations = escapedLines
      .map((line, index) => `BT /F1 12 Tf 56 ${760 - index * 22} Td (${line}) Tj ET`)
      .join('\n');
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${Buffer.byteLength(textOperations)} >> stream\n${textOperations}\nendstream endobj`,
    ];
    const offsets: number[] = [];
    let pdf = '%PDF-1.4\n';
    for (const object of objects) {
      offsets.push(Buffer.byteLength(pdf));
      pdf += `${object}\n`;
    }
    const xrefOffset = Buffer.byteLength(pdf);
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) {
      pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf);
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markNotificationsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
