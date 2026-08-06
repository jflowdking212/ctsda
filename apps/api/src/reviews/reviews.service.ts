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
  submitted: ['under_review', 'changes_requested', 'approved', 'rejected'],
  initial_screening: ['under_review', 'changes_requested', 'approved', 'rejected'],
  payment_pending: ['under_review'],
  under_review: ['changes_requested', 'final_review', 'approved', 'rejected'],
  changes_requested: ['under_review', 'approved', 'rejected', 'resubmitted'],
  resubmitted: ['under_review', 'changes_requested', 'approved', 'rejected'],
  final_review: ['approved', 'rejected'],
  approved: ['under_review'],
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
      include: { applicant: true, institution: { include: { contacts: true } } },
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

            if (app.applicantId) {
              await tx.notification.create({
                data: {
                  userId: app.applicantId,
                  type: 'approved',
                  title: 'Application Approved - Payment Required',
                  body: 'Your CTSDA accreditation application has been approved. Please complete payment of the accreditation fee to receive your certificate.',
                  metadata: { applicationId },
                },
              });
            }

            const envUrl = process.env.FRONTEND_URL || '';
            const baseUrl = (!envUrl || envUrl.includes('localhost')) ? 'https://ctsda.acecoterieconsulting.com' : envUrl;
            const paymentLink = `${baseUrl}/payment/${invoice.id}`;
            const targetEmail = app.applicantEmail || app.applicant?.email || app.institution?.email || app.institution?.contacts?.find((c: any) => c.isPrimary)?.email || app.institution?.contacts?.[0]?.email;
            if (targetEmail) {
              await this.notificationsService.enqueueEmail({
                to: targetEmail,
                subject: `CTSDA Accreditation Approved - ${app.institution?.name || 'Institution'}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #10b981; margin-bottom: 5px;">Congratulations! Application Approved</h2>
                    <p>Dear ${app.applicantFirstName || app.applicant?.firstName || 'Applicant'},</p>
                    <p>We are pleased to inform you that the accreditation application for <strong>${app.institution?.name || 'your institution'}</strong> has been <strong>APPROVED</strong> by the CTSDA Accreditation Board!</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #10b981; border-radius: 4px; margin: 20px 0;">
                      <p style="margin: 0; font-weight: bold; color: #1e293b;">Accreditation Fee & Certificate Issuance:</p>
                      <p style="margin: 5px 0 0 0; color: #475569;">To finalize your accreditation and issue your official CTSDA Certificate, please complete payment of your accreditation fee.</p>
                    </div>
                    <p style="text-align: center; margin: 25px 0;">
                      <a href="${paymentLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Payment Now</a>
                    </p>
                    <p style="font-size: 0.85rem; color: #64748b;">If paying via manual bank transfer, our finance team will verify your receipt and immediately activate your accreditation credentials.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0 15px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} CTSDA - Council For Training Skills & Development America.</p>
                  </div>
                `,
                userId: app.applicantId || 'system',
              });
            }

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
            const verificationBaseUrl = process.env.FRONTEND_URL || 'https://ctsda.acecoterieconsulting.com';
            const qrCodeUrl = verificationBaseUrl + '/verify?token=' + verificationToken;
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

            if (app.applicantId) {
              await tx.notification.create({
                data: {
                  userId: app.applicantId,
                  type: 'approved',
                  title: 'Application approved',
                  body: 'Your CTSDA accreditation application has been approved.',
                  metadata: { applicationId, accreditationId: acc.id },
                },
              });
            }

            const targetEmail = app.applicantEmail || app.applicant?.email;
            if (targetEmail) {
              await this.notificationsService.enqueueEmail({
                to: targetEmail,
                subject: `CTSDA Accreditation Approved - ${app.institution?.name}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #10b981; margin-bottom: 5px;">Congratulations! Application Approved</h2>
                    <p>Dear ${app.applicantFirstName || app.applicant?.firstName || 'Applicant'},</p>
                    <p>Your application for CTSDA accreditation for <strong>${app.institution?.name}</strong> has been approved, and your official certificate has been issued!</p>
                    <p>You can access your portal to view and download your accreditation credentials.</p>
                  </div>
                `,
                userId: app.applicantId || 'system',
              });
            }
          }
        } else if (newStatus === 'under_review') {
          const targetEmail = app.applicantEmail || app.applicant?.email || app.institution?.email || app.institution?.contacts?.find((c: any) => c.isPrimary)?.email || app.institution?.contacts?.[0]?.email;
          if (targetEmail) {
            await this.notificationsService.enqueueEmail({
              to: targetEmail,
              subject: `CTSDA Application Status Update: Under Review`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h2 style="color: #2563eb; margin-bottom: 5px;">Application Status Update: Under Review</h2>
                  <p>Dear ${app.applicantFirstName || app.applicant?.firstName || 'Applicant'},</p>
                  <p>Your accreditation application for <strong>${app.institution?.name || 'your institution'}</strong> has been moved to <strong>Under Review</strong> by the CTSDA Accreditation Board.</p>
                  <p>Our review committee is actively evaluating your institution profile and compliance documentation. You will receive further updates as our review progresses.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0 15px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} CTSDA - Council For Training Skills & Development America.</p>
                </div>
              `,
              userId: app.applicantId || 'system',
            });
          }
        } else if (newStatus === 'rejected') {
          const targetEmail = app.applicantEmail || app.applicant?.email || app.institution?.email || app.institution?.contacts?.find((c: any) => c.isPrimary)?.email || app.institution?.contacts?.[0]?.email;
          if (targetEmail) {
            await this.notificationsService.enqueueEmail({
              to: targetEmail,
              subject: `Update on your CTSDA Accreditation Application`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h2 style="color: #b91c1c; margin-bottom: 5px;">Application Status Update</h2>
                  <p>Dear ${app.applicantFirstName || app.applicant?.firstName || 'Applicant'},</p>
                  <p>We have completed the review of your application for <strong>${app.institution?.name || 'your institution'}</strong>. Unfortunately, your application has not been approved at this time.</p>
                  ${metadata?.reason ? `<p><strong>Reason:</strong> ${metadata.reason}</p>` : ''}
                  ${metadata?.comments ? `<p><strong>Comments:</strong> ${metadata.comments}</p>` : ''}
                  <p>If you have questions or require further clarification, please contact our support team at <a href="mailto:management@ctsdamerica.com">management@ctsdamerica.com</a>.</p>
                </div>
              `,
              userId: app.applicantId || 'system',
            });
          }
        } else if (newStatus === 'changes_requested') {
          const targetEmail = app.applicantEmail || app.applicant?.email || app.institution?.email || app.institution?.contacts?.find((c: any) => c.isPrimary)?.email || app.institution?.contacts?.[0]?.email;
          if (targetEmail) {
            await this.notificationsService.enqueueEmail({
              to: targetEmail,
              subject: `Action Required: CTSDA Accreditation Application`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h2 style="color: #c2410c; margin-bottom: 5px;">Action Required</h2>
                  <p>Dear ${app.applicantFirstName || app.applicant?.firstName || 'Applicant'},</p>
                  <p>Our review team requires additional information or updates regarding your application for <strong>${app.institution?.name || 'your institution'}</strong>.</p>
                  ${metadata?.reason ? `<p><strong>Reason:</strong> ${metadata.reason}</p>` : ''}
                  ${metadata?.comments ? `<p><strong>Comments:</strong> ${metadata.comments}</p>` : ''}
                  <p>Please respond or submit the requested updates to <a href="mailto:management@ctsdamerica.com">management@ctsdamerica.com</a>.</p>
                </div>
              `,
              userId: app.applicantId || 'system',
            });
          }
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
      where: {
        OR: [
          { verificationToken: token },
          { certificateNumber: token },
          { accreditation: { accreditationCode: token } },
        ],
      },
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
            application: {
              include: {
                applicant: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                trainingAreas: {
                  include: {
                    trainingArea: true,
                  },
                },
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
