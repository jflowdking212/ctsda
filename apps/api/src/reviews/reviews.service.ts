import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ApplicationStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { randomBytes } from 'crypto';
import QRCode from 'qrcode';
import { PrismaService } from '../common/prisma.service';

// Roles permitted to perform review actions (status transitions, checklist,
// internal notes). Excludes content_manager and auditor, who have no review
// authority. Used by assertCanReview() to close the authz hole where any
// authenticated user could previously approve/reject an application.
const REVIEW_ACTION_ROLES = [
  'super_admin',
  'reviewer',
  'support_officer',
  'finance_officer',
];

const ALLOWED_TRANSITIONS: Record<string, ApplicationStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review', 'changes_requested', 'rejected'],
  initial_screening: ['under_review', 'changes_requested', 'rejected'],
  payment_pending: ['under_review'],
  under_review: ['changes_requested', 'final_review', 'approved', 'rejected'],
  changes_requested: ['resubmitted'],
  resubmitted: ['under_review'],
  final_review: ['approved', 'rejected'],
  approved: [],
  rejected: ['under_review'],
  withdrawn: [],
};

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    @InjectQueue('certificates') private certificateQueue: Queue,
  ) {}

  /**
   * Assert the actor holds a role authorised to perform review actions.
   * Mirrors the existing role-check pattern in assignReviewer so the whole
   * review surface is gated, not just reviewer assignment.
   */
  private async assertCanReview(actorId: string) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true, isActive: true },
    });
    if (!actor || !actor.isActive || !REVIEW_ACTION_ROLES.includes(actor.role)) {
      throw new ForbiddenException('Insufficient permissions to perform review actions');
    }
    return actor;
  }

  async assignReviewer(applicationId: string, reviewerId: string, actorId: string) {
    // Reviewer assignment is narrower than general review actions: only
    // super_admin and support_officer may reassign. (assertCanReview is too
    // broad here, so we keep the explicit role check.)
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { role: true, isActive: true },
    });
    if (!actor || !actor.isActive || !['super_admin', 'support_officer'].includes(actor.role)) {
      throw new ForbiddenException('Only admins can assign reviewers');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: { reviewedBy: reviewerId },
      });

      await tx.auditLog.create({
        data: {
          userId: actorId,
          action: 'reviewer_assigned',
          entityType: 'application',
          entityId: applicationId,
          metadata: { reviewerId },
        },
      });

      await tx.notification.create({
        data: {
          userId: reviewerId,
          type: 'reviewer_assigned',
          title: 'Application assigned',
          body: `You have been assigned application ${applicationId}.`,
        },
      });

      return updated;
    });
  }

  async addComment(applicationId: string, authorId: string, content: string, isInternal = false) {
    if (isInternal) {
      // Internal (admin-only) notes require review authority.
      await this.assertCanReview(authorId);
    } else {
      // Public comments are allowed for reviewers/admins OR the applicant who
      // owns the application — not arbitrary authenticated users.
      const actor = await this.prisma.user.findUnique({
        where: { id: authorId },
        select: { role: true, isActive: true },
      });
      const isReviewer = actor?.isActive && REVIEW_ACTION_ROLES.includes(actor.role);
      if (!isReviewer) {
        const app = await this.prisma.application.findUnique({
          where: { id: applicationId },
          select: { applicantId: true },
        });
        if (!app || app.applicantId! !== authorId) {
          throw new ForbiddenException('You cannot comment on this application');
        }
      }
    }
    return this.prisma.applicationComment.create({
      data: { applicationId, authorId, content, isInternal },
    });
  }

  async createChecklistItem(applicationId: string, actorId: string, label: string) {
    await this.assertCanReview(actorId);
    return this.prisma.applicationChecklistItem.create({
      data: { applicationId, label },
    });
  }

  async setChecklistItemCompleted(itemId: string, actorId: string, isCompleted: boolean) {
    await this.assertCanReview(actorId);
    return this.prisma.applicationChecklistItem.update({
      where: { id: itemId },
      data: {
        isCompleted,
        completedBy: isCompleted ? actorId : null,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }

  async transitionStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    actorId: string,
    metadata?: Record<string, any>,
  ) {
    // Close the authz hole: only review-authorised roles may transition status.
    await this.assertCanReview(actorId);

    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true },
    });
    if (!app) throw new BadRequestException('Application not found');

    const currentStatus = app.status as ApplicationStatus;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    if (currentStatus === 'payment_pending' && newStatus === 'under_review') {
      const invoice = await this.prisma.invoice.findFirst({
        where: { applicationId, status: 'paid' },
      });
      if (!invoice) {
        throw new BadRequestException('Invoice must be paid before review');
      }
    }

    let certificateId: string | undefined;
    const updated = await this.prisma.$transaction(
      async (tx) => {
        const next = await tx.application.update({
          where: { id: applicationId },
          data: {
            status: newStatus,
            ...(metadata?.reviewerId && { reviewedBy: metadata.reviewerId }),
            ...(metadata?.comments && { reviewerNotes: metadata.comments }),
            ...(newStatus === 'submitted' && { submittedAt: new Date() }),
            ...(newStatus === 'approved' || newStatus === 'rejected'
              ? { reviewedAt: new Date() }
              : {}),
          },
        });

        await tx.applicationStatusHistory.create({
          data: {
            applicationId,
            fromStatus: currentStatus,
            toStatus: newStatus,
            changedBy: actorId,
            reason: metadata?.reason,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: actorId,
            action: 'status_transition',
            entityType: 'application',
            entityId: applicationId,
            metadata: { from: currentStatus, to: newStatus, ...metadata },
          },
        });

        if (newStatus === 'approved') {
          const settings = await tx.siteSetting.findMany();
          const getSetting = (key: string) => settings.find(s => s.key === key)?.value;
          const workflow = getSetting('accreditationWorkflow') || 'review_first';
          const accreditationFee = Number(getSetting('accreditationFee')) || 500;

          if ((workflow === 'review_first' || workflow === 'hybrid') && accreditationFee > 0) {
            // Post-approval invoicing
            const invoice = await tx.invoice.create({
              data: {
                invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                applicationId,
                amount: accreditationFee,
                currency: 'USD',
                status: 'sent',
                description: 'CTSDA Final Accreditation Fee',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                createdBy: actorId,
              },
            });

            await tx.notification.create({
              data: {
                userId: app.applicantId!,
                type: 'approved_pending_payment' as any,
                title: 'Application Approved - Payment Required',
                body: 'Your CTSDA accreditation application has been approved. Please complete payment of the accreditation fee to receive your certificate.',
                metadata: { applicationId },
              },
            });

            const paymentLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${invoice.id}`;
            await this.notificationsService.enqueueEmail({
              to: (app.applicantEmail || app.applicant?.email || ""),
              subject: 'CTSDA Accreditation Approved - Payment Required',
              html: `
                <h1>Congratulations!</h1>
                <p>Hi ${(app.applicantFirstName || app.applicant?.firstName)},</p>
                <p>Your application for CTSDA accreditation has been approved!</p>
                <p>To finalize your accreditation and generate your certificate, please pay the accreditation fee.</p>
                <a href="${paymentLink}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Pay Now</a>
              `,
              userId: app.applicantId!,
            });

          } else {
            // Immediate issuance (Pay Upfront or zero fee)
            const acc = await tx.accreditation.create({
              data: {
                institutionId: app.institutionId,
                applicationId,
                accreditationCode: this.generateAccreditationCode(),
                status: 'active',
                issuedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              },
            });

            const verificationToken = this.generateVerificationToken();
            const verificationBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const qrCodeUrl = await QRCode.toDataURL(verificationBaseUrl + '/verify?token=' + verificationToken);
            const certificate = await tx.certificate.create({
              data: {
                accreditationId: acc.id,
                certificateNumber: this.generateCertificateNumber(),
                status: 'active',
                issueDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                verificationToken,
                qrCodeUrl,
              },
            });
            certificateId = certificate.id;

            await tx.notification.create({
              data: {
                userId: app.applicantId!,
                type: 'approved',
                title: 'Application approved',
                body: 'Your CTSDA accreditation application has been approved.',
                metadata: { applicationId, accreditationId: acc.id },
              },
            });

            await this.notificationsService.enqueueEmail({
              to: (app.applicantEmail || app.applicant?.email || ""),
              subject: 'CTSDA Accreditation Approved',
              html: `
                <h1>Congratulations!</h1>
                <p>Hi ${(app.applicantFirstName || app.applicant?.firstName)},</p>
                <p>Your application for CTSDA accreditation has been approved, and your certificate has been issued!</p>
                <p>You can view your dashboard to download your certificate.</p>
              `,
              userId: app.applicantId!,
            });
          }
        } else if (newStatus === 'rejected') {
          await this.notificationsService.enqueueEmail({
              to: (app.applicantEmail || app.applicant?.email || ""),
            subject: 'Update on your CTSDA Application',
            html: `
              <h1>Application Update</h1>
              <p>Hi ${(app.applicantFirstName || app.applicant?.firstName)},</p>
              <p>We have reviewed your application. Unfortunately, it has been rejected at this time.</p>
              ${metadata?.reason ? `<p><strong>Reason:</strong> ${metadata.reason}</p>` : ''}
              ${metadata?.comments ? `<p><strong>Comments:</strong> ${metadata.comments}</p>` : ''}
              <p>Please contact support for more details.</p>
            `,
            userId: app.applicantId!,
          });
        } else if (newStatus === 'changes_requested') {
          await this.notificationsService.enqueueEmail({
              to: (app.applicantEmail || app.applicant?.email || ""),
            subject: 'Action Required: CTSDA Application',
            html: `
              <h1>Action Required</h1>
              <p>Hi ${(app.applicantFirstName || app.applicant?.firstName)},</p>
              <p>We need some changes or additional information before we can proceed with your application.</p>
              ${metadata?.reason ? `<p><strong>Reason:</strong> ${metadata.reason}</p>` : ''}
              ${metadata?.comments ? `<p><strong>Comments:</strong> ${metadata.comments}</p>` : ''}
              <p>Please log in to your dashboard to make the necessary updates.</p>
            `,
            userId: app.applicantId!,
          });
        }

        return next;
      },
      { maxWait: 5000, timeout: 15000 },
    );

    if (newStatus === 'approved' && certificateId) {
      await this.certificateQueue.add(
        'generate-certificate-pdf',
        { certificateId, applicationId },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
      );
    }

    return updated;
  }

  private generateAccreditationCode(): string {
    const bytes = randomBytes(4);
    return `CTSDA-${bytes.toString('hex').toUpperCase()}`;
  }

  private generateCertificateNumber(): string {
    return randomBytes(6).toString('hex').toUpperCase();
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString('base64url');
  }

  async findCertificateByToken(token: string) {
    return this.prisma.certificate.findFirst({
      where: { verificationToken: token },
      include: {
        accreditation: {
          include: {
            institution: {
              select: {
                name: true,
                registrationNumber: true,
                country: true,
              },
            },
          },
        },
      },
    });
  }

  async logVerificationEvent(certificateId: string, ipAddress?: string, userAgent?: string) {
    return this.prisma.verificationEvent.create({
      data: { certificateId, ipAddress, userAgent },
    });
  }

  async listInstitutions() {
    return this.prisma.institution.findMany({
      where: { accreditations: { some: { status: 'active' } } },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        institutionType: true,
        description: true,
        accreditations: {
          where: { status: 'active' },
          select: {
            id: true,
            accreditationCode: true,
            issuedAt: true,
            expiresAt: true,
          },
        },
      },
    });
  }
}
