import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

@Injectable()
export class PaymentsService {
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

    const job = await this.paymentQueue.add(
      'create-checkout',
      { invoiceId: invoice.id, applicationId, userId },
      { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    );

    await this.paymentQueue.add(
      'generate-invoice-pdf',
      { invoiceId: invoice.id, applicationId, userId },
      { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    );

    return { jobId: job.id };
  }

  async handleWebhook(payload: any, signature?: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && !this.verifyWebhookSignature(payload, signature, webhookSecret)) {
      throw new BadRequestException('Invalid payment provider signature');
    }

    const eventId = payload.eventId || payload.id || payload.paymentId;
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
      where: { id: payload.invoiceId },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'paid',
      },
    });

    await this.prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        provider: payload.provider || 'stripe',
        providerPaymentId: payload.paymentId,
        providerEventId: eventId,
        idempotencyKey: payload.idempotencyKey || `webhook:${eventId}`,
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

  private verifyWebhookSignature(payload: any, signature: string | undefined, secret: string): boolean {
    if (!signature) return false;

    const expected = createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const actual = signature.replace(/^sha256=/, '');
    if (!/^[a-f0-9]+$/i.test(actual)) return false;

    const expectedBuffer = Buffer.from(expected, 'hex');
    const actualBuffer = Buffer.from(actual, 'hex');

    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
  }
}
