import { BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentsService } from '../src/payments/payments.service';

describe('PaymentsService Stripe integration', () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const originalStripeKey = process.env.STRIPE_SECRET_KEY;
  const stripe = new Stripe('sk_test_unit');

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
    process.env.STRIPE_SECRET_KEY = originalStripeKey;
    jest.restoreAllMocks();
  });

  it('creates a Stripe Checkout Session for an application invoice', async () => {
    process.env.FRONTEND_URL = 'http://localhost:3000';
    const checkout = {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_1',
          url: 'https://checkout.stripe.com/c/pay/cs_test_1',
        }),
      },
    };
    const stripeMock = { checkout } as unknown as Stripe;
    const prisma = {
      application: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'application-1',
          applicantId: 'user-1',
          institution: { name: 'Acme Training', email: 'billing@example.com' },
        }),
      },
      invoice: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'invoice-1',
          amount: 50000,
          currency: 'USD',
        }),
      },
    } as any;
    const queue = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) } as any;
    const service = new PaymentsService(prisma, queue, stripeMock);

    await expect(service.createCheckoutSession('user-1', 'application-1')).resolves.toEqual({
      url: 'https://checkout.stripe.com/c/pay/cs_test_1',
      sessionId: 'cs_test_1',
      invoiceId: 'invoice-1',
    });

    expect(checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        success_url: expect.stringContaining('{CHECKOUT_SESSION_ID}'),
        metadata: {
          invoiceId: 'invoice-1',
          applicationId: 'application-1',
          userId: 'user-1',
        },
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: 'usd',
              unit_amount: 50000,
            }),
          }),
        ],
      }),
      { idempotencyKey: 'checkout:invoice-1' },
    );
  });

  it('treats repeated provider events as idempotent replays', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
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

  it('rejects malformed Stripe webhook signatures when a webhook secret is configured', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    const service = new PaymentsService({} as any, { add: jest.fn() } as any, stripe);

    await expect(
      service.handleWebhook({}, 'not-a-stripe-signature', Buffer.from('{}')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts a valid checkout.session.completed webhook and records the payment once', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    const event = {
      id: 'evt_1',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_1',
          object: 'checkout.session',
          payment_intent: 'pi_1',
          metadata: { invoiceId: 'invoice-1' },
        },
      },
    };
    const rawBody = Buffer.from(JSON.stringify(event));
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: rawBody.toString(),
      secret: 'whsec_test',
    });
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
    const service = new PaymentsService(prisma, { add: jest.fn() } as any, stripe);

    await expect(service.handleWebhook(event, signature, rawBody)).resolves.toEqual({ success: true });
    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 'invoice-1' },
      data: { status: 'paid', paidAt: expect.any(Date) },
    });
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: 'stripe',
        providerEventId: 'evt_1',
        providerPaymentId: 'pi_1',
        idempotencyKey: 'stripe:evt_1',
      }),
    });
  });
});
