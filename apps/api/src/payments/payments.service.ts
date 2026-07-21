import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripeClient?: Stripe;

  constructor(
    private prisma: PrismaService,
    @InjectQueue('payments') private paymentQueue: Queue,
  ) {}

  async createCheckoutSession(userId: string, applicationId: string) {
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

    const invoice = existingInvoice
      ? await this.prisma.invoice.update({
          where: { id: existingInvoice.id },
          data: {},
        })
      : await this.prisma.invoice.create({
          data: {
            invoiceNumber: this.generateInvoiceNumber(),
            applicationId,
            amount: 50000,
          currency: 'USD',
          status: 'sent',
          description: 'CTSDA accreditation application fee',
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
              unit_amount: Number(invoice.amount),
              product_data: {
                name: 'CTSDA accreditation application fee',
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
    const invoiceId = session.metadata?.invoiceId;
    if (!invoiceId) {
      throw new BadRequestException('Missing invoice metadata');
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
