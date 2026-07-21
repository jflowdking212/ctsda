import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private paymentsService: PaymentsService,
  ) {}

  async getMyApplications(applicantId: string) {
    return this.prisma.application.findMany({
      where: { applicantId },
      include: { 
        institution: { select: { name: true, country: true } },
        invoices: {
          where: { status: 'sent' },
          select: { id: true, amount: true, description: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
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

    // Otherwise, transition straight to submitted
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'submitted', submittedAt: new Date() },
    });

    return { message: 'Application submitted successfully', status: 'submitted' };
  }
}
