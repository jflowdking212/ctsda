import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
  ) {}

  async getMyApplications(applicantId: string) {
    return this.prisma.application.findMany({
      where: { applicantId },
      include: { 
        institution: { select: { name: true, country: true } },
        invoices: {
          where: { status: 'sent' },
          select: { id: true, amount: true, description: true }
        },
        accreditations: {
          select: { id: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { institution: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }
    if (application.applicantId !== userId) {
      throw new ForbiddenException('Not your application');
    }
    if (application.status !== 'draft') {
      throw new BadRequestException('Only draft applications can be submitted');
    }

    const settings = await this.settingsService.getAll();
    const workflow = settings.accreditationWorkflow || 'review_first';

    if (workflow === 'pay_upfront' || workflow === 'hybrid') {
      // Must pay upfront
      const appFee = settings.applicationFee || 0;
      if (appFee > 0) {
        await this.prisma.application.update({
          where: { id: applicationId },
          data: { status: 'payment_pending' },
        });

        const checkout = await this.paymentsService.createCheckoutSession(userId, applicationId);
        return { message: 'Payment required to submit application', status: 'payment_pending', paymentUrl: checkout.url };
      }
    }

    // Transition to submitted
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'submitted', submittedAt: new Date() },
    });

    // Notify all admin users in DB + adminNotificationEmail
    const adminUsers = await this.prisma.user.findMany({
      where: {
        role: { in: ['super_admin', 'support_officer'] },
        isActive: true,
      },
      select: { id: true, email: true },
    });

    const instName = application.institution?.name || 'an institution';

    // 1. Create in-app notification for each admin
    for (const admin of adminUsers) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'application_submitted' as any,
          title: 'New Application Submitted',
          body: `An application for "${instName}" has been submitted and is pending review.`,
          metadata: { applicationId, institutionId: application.institutionId },
        },
      });
    }

    // 2. Collect unique admin emails to notify
    const recipientEmails = new Set<string>();
    adminUsers.forEach((u) => {
      if (u.email) recipientEmails.add(u.email);
    });
    if (settings.adminNotificationEmail) {
      recipientEmails.add(settings.adminNotificationEmail);
    }

    // 3. Send email notifications
    for (const email of Array.from(recipientEmails)) {
      await this.notificationsService.enqueueEmail({
        to: email,
        subject: `New Application Submitted: ${instName}`,
        html: `
          <h2>New Application Pending Review</h2>
          <p>An application for <strong>${instName}</strong> has been submitted by an applicant and is pending administrative review.</p>
          <p><a href="${process.env.FRONTEND_URL || 'https://ctsda.acecoterieconsulting.com'}/admin/queue?appId=${applicationId}" style="display:inline-block;padding:10px 18px;background:#0d9488;color:#ffffff;text-decoration:none;border-radius:6px;">Review Application</a></p>
        `,
        userId: userId,
      });
    }

    return { message: 'Application submitted successfully', status: 'submitted' };
  }
}
