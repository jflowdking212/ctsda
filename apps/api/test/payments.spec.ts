import { createHmac } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { PaymentsService } from '../src/payments/payments.service';

describe('PaymentsService webhooks', () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    jest.restoreAllMocks();
  });

  it('treats repeated provider events as idempotent replays', async () => {
    const prisma = {
      payment: { findFirst: jest.fn().mockResolvedValue({ id: 'payment-1' }) },
      invoice: { findFirst: jest.fn(), update: jest.fn() },
    } as any;
    const service = new PaymentsService(prisma, { add: jest.fn() } as any);

    await expect(service.handleWebhook({ eventId: 'evt-1', invoiceId: 'invoice-1' })).resolves.toEqual({
      success: true,
      replayed: true,
      paymentId: 'payment-1',
    });
    expect(prisma.invoice.update).not.toHaveBeenCalled();
  });

  it('rejects malformed signatures when a webhook secret is configured', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'secret';
    const service = new PaymentsService({} as any, { add: jest.fn() } as any);

    await expect(
      service.handleWebhook({ eventId: 'evt-1', invoiceId: 'invoice-1' }, 'sha256=not-hex'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a valid signature and records the payment once', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'secret';
    const payload = { eventId: 'evt-1', invoiceId: 'invoice-1', paymentId: 'pay-1' };
    const signature = `sha256=${createHmac('sha256', 'secret').update(JSON.stringify(payload)).digest('hex')}`;
    const prisma = {
      payment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'payment-1' }),
      },
      invoice: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'invoice-1',
          amount: 50000,
          currency: 'USD',
          createdBy: 'user-1',
        }),
        update: jest.fn().mockResolvedValue({ id: 'invoice-1' }),
      },
    } as any;
    const service = new PaymentsService(prisma, { add: jest.fn() } as any);

    await expect(service.handleWebhook(payload, signature)).resolves.toEqual({ success: true });
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 'invoice-1' },
      data: { status: 'paid' },
    });
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        providerEventId: 'evt-1',
        providerPaymentId: 'pay-1',
        idempotencyKey: 'webhook:evt-1',
      }),
    });
  });
});
