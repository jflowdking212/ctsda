import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';
import { SettingsService } from '../settings/settings.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private stripeClient?: Stripe;

  constructor(
    private prisma: PrismaService,
    @InjectQueue('payments') private paymentQueue: Queue,
    private settingsService: SettingsService,
    private notificationsService: NotificationsService,
  ) {}

  async createCheckoutSession(userId: string, applicationId: string, feeAmount: number = 500, description: string = 'CTSDA accreditation application fee') {
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

    const existingInvoice = await this.prisma.invoice.findFirst({
      where: { applicationId },
    });

    if (existingInvoice && existingInvoice.status === 'paid') {
      return { url: null, message: 'Already paid' };
    }

    const invoiceAmount = Math.round(feeAmount * 100);

    const invoice = existingInvoice
      ? await this.prisma.invoice.update({
          where: { id: existingInvoice.id },
          data: { amount: feeAmount, description },
        })
      : await this.prisma.invoice.create({
          data: {
            invoiceNumber: this.generateInvoiceNumber(),
            applicationId,
            amount: feeAmount,
          currency: 'USD',
          status: 'sent',
          description,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          createdBy: userId,
          },
        });

    await this.paymentQueue.add(
      'generate-invoice-pdf',
      { invoiceId: invoice.id, applicationId, userId },
      { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    );

    const stripe = this.getStripe();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        success_url: `${frontendUrl}/portal/applications?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/portal/applications?payment=cancelled`,
        customer_email: application.institution.email,
        metadata: {
          invoiceId: invoice.id,
          applicationId,
          userId,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: invoice.currency.toLowerCase(),
              unit_amount: Math.round(Number(invoice.amount) * 100),
              product_data: {
                name: description,
                description: application.institution.name,
              },
            },
          },
        ],
      },
      { idempotencyKey: `checkout:${invoice.id}` },
    );

    return { url: session.url, sessionId: session.id, invoiceId: invoice.id };
  }

  async handleWebhook(payload: any, signature?: string, rawBody?: Buffer | string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const event = webhookSecret
      ? this.constructStripeEvent(rawBody, signature, webhookSecret)
      : payload;

    if (event.type === 'checkout.session.completed') {
      return this.handleCheckoutCompleted(event);
    }

    if (event.type) {
      return { success: true, ignored: true, type: event.type };
    }

    return this.handleProviderPayment({
      eventId: payload.eventId || payload.id || payload.paymentId,
      invoiceId: payload.invoiceId,
      providerPaymentId: payload.paymentId,
      provider: payload.provider || 'stripe',
      idempotencyKey: payload.idempotencyKey,
    });
  }

  private async handleCheckoutCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Check if this is a training enrollment checkout
    const trainingEnrollmentId = session.metadata?.trainingEnrollmentId;
    const trainingId = session.metadata?.trainingId;
    const guestEmail = session.metadata?.guestEmail;

    if (trainingEnrollmentId) {
      await this.prisma.trainingEnrollment.update({
        where: { id: trainingEnrollmentId },
        data: { status: 'paid' },
      });
      return { success: true, type: 'training_enrollment' };
    } else if (trainingId && guestEmail) {
      // Guest checkout success
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
      
      const newUser = await this.prisma.user.create({
        data: {
          email: guestEmail,
          passwordHash,
          firstName: 'Guest',
          lastName: 'User',
          role: 'applicant',
          isActive: true,
        }
      });

      const training = await this.prisma.training.findUnique({ where: { id: trainingId } });
      
      await this.prisma.trainingEnrollment.create({
        data: {
          userId: newUser.id,
          trainingId: trainingId,
          status: 'paid',
          amountPaid: training ? training.price : 0,
          stripeSessionId: session.id,
        }
      });
      return { success: true, type: 'training_guest_enrollment' };
    }

    // Default to invoice checkout
    const invoiceId = session.metadata?.invoiceId;
    if (!invoiceId) {
      throw new BadRequestException('Missing invoice or training metadata');
    }

    return this.handleProviderPayment({
      eventId: event.id,
      invoiceId,
      providerPaymentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
      provider: 'stripe',
      idempotencyKey: `stripe:${event.id}`,
    });
  }

  private async handleProviderPayment(data: {
    eventId?: string;
    invoiceId?: string;
    providerPaymentId?: string | null;
    provider: string;
    idempotencyKey?: string;
  }) {
    const eventId = data.eventId;
    if (!eventId) {
      throw new BadRequestException('Missing payment provider event id');
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { providerEventId: eventId },
    });
    if (existingPayment) {
      return { success: true, replayed: true, paymentId: existingPayment.id };
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: data.invoiceId },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
      },
    });

    await this.prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        provider: data.provider,
        providerPaymentId: data.providerPaymentId,
        providerEventId: eventId,
        idempotencyKey: data.idempotencyKey || `webhook:${eventId}`,
        processedBy: invoice.createdBy,
        status: 'completed',
      },
    });

    if (invoice.applicationId) {
      const application = await this.prisma.application.findUnique({
        where: { id: invoice.applicationId },
        include: { institution: true },
      });
      if (application && application.status === 'payment_pending') {
        await this.prisma.application.update({
          where: { id: application.id },
          data: { status: 'submitted', submittedAt: new Date() },
        });

        const settings = await this.settingsService.getAll();
        if (settings.adminNotificationEmail) {
          await this.notificationsService.enqueueEmail({
            to: settings.adminNotificationEmail,
            subject: 'New Application Pending Review (Fee Paid)',
            html: `<p>A new application has been submitted by ${application.institution?.name} after paying the application fee and is now pending review.</p>`,
            userId: invoice.createdBy || application.applicantId,
          });
        }
      } else if (application && application.status === 'approved' && invoice.description === 'CTSDA Final Accreditation Fee') {
        // Issue the accreditation now that the fee is paid
        const crypto = require('crypto');
        const QRCode = require('qrcode');
        
        const acc = await this.prisma.accreditation.create({
          data: {
            institutionId: application.institutionId,
            applicationId: application.id,
            accreditationCode: `CTSDA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            status: 'active',
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });

        const verificationToken = crypto.randomBytes(32).toString('base64url');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const qrCodeUrl = await QRCode.toDataURL(`${frontendUrl}/verify?token=${verificationToken}`);
        
        const certificate = await this.prisma.certificate.create({
          data: {
            accreditationId: acc.id,
            certificateNumber: crypto.randomBytes(6).toString('hex').toUpperCase(),
            status: 'active',
            issueDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            verificationToken,
            qrCodeUrl,
          },
        });

        const accountSetupToken = crypto.randomBytes(32).toString('base64url');
        
        await this.prisma.user.update({
          where: { id: application.applicantId },
          data: { emailVerificationToken: accountSetupToken, isActive: true }, // Reusing this column for account setup
        });

        const user = await this.prisma.user.findUnique({ where: { id: application.applicantId } });

        await this.prisma.notification.create({
          data: {
            userId: application.applicantId,
            type: 'approved',
            title: 'Application approved - Certificate Issued',
            body: 'We have received your accreditation fee. Your CTSDA accreditation application is fully approved and your certificate has been issued.',
            metadata: { applicationId: application.id, accreditationId: acc.id },
          },
        });

        if (user) {
          await this.notificationsService.enqueueEmail({
            to: user.email,
            subject: 'Set up your CTSDA Account',
            html: `
              <h1>Welcome to CTSDA</h1>
              <p>Hi ${user.firstName},</p>
              <p>We have received your payment, and your certificate has been issued!</p>
              <p>Please click the link below to set up your password and access your dashboard.</p>
              <a href="${frontendUrl}/setup-account?token=${accountSetupToken}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Set Up Account</a>
            `,
            userId: user.id,
          });
        }

        await this.paymentQueue.add(
          'generate-certificate-pdf',
          { certificateId: certificate.id, applicationId: application.id },
          { attempts: 3, backoff: { type: 'exponential', delay: 1000 } }
        );
      }
    }

    return { success: true };
  }

  async refund(userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!['super_admin', 'finance_officer'].includes(user?.role || '')) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (invoice.status !== 'paid') {
      throw new BadRequestException('Invoice is not paid');
    }

    await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: -invoice.amount,
        currency: invoice.currency,
        provider: 'manual',
        idempotencyKey: `refund:${invoiceId}:${randomUUID()}`,
        processedBy: userId,
        status: 'refunded',
      },
    });

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'refunded' },
    });

    return { success: true };
  }

  private generateInvoiceNumber(): string {
    return `INV-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  private getStripe() {
    if (this.stripeClient) return this.stripeClient;

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    this.stripeClient = new Stripe(secretKey);
    return this.stripeClient;
  }

  private constructStripeEvent(rawBody: Buffer | string | undefined, signature: string | undefined, secret: string) {
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing Stripe webhook signature');
    }

    try {
      return this.getStripe().webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      throw new BadRequestException('Invalid payment provider signature');
    }
  }
}
