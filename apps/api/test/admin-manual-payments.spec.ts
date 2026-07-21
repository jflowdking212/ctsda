import { ForbiddenException } from '@nestjs/common';
import { AdminService } from '../src/admin/admin.service';

describe('AdminService manual payments', () => {
  function makeService(role = 'finance_officer', invoice: any = null) {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'actor-1',
          email: 'finance@example.com',
          firstName: 'Finn',
          lastName: 'Finance',
          role,
          isActive: true,
        }),
      },
      application: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'app-1',
          status: 'payment_pending',
          invoices: invoice ? [invoice] : [],
        }),
      },
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
      invoice: {
        update: jest.fn().mockResolvedValue({
          id: invoice?.id || 'invoice-1',
          amount: invoice?.amount || 50000,
          currency: invoice?.currency || 'USD',
        }),
        create: jest.fn().mockResolvedValue({
          id: 'invoice-created',
          amount: 50000,
          currency: 'USD',
        }),
      },
      payment: {
        create: jest.fn().mockResolvedValue({ id: 'payment-1' }),
      },
      applicationStatusHistory: { create: jest.fn().mockResolvedValue({ id: 'history-1' }) },
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
    } as any;
    prisma.application.update = jest.fn().mockResolvedValue({ id: 'app-1', status: 'under_review' });

    return { service: new AdminService(prisma, {} as any, {} as any), prisma };
  }

  it('allows finance officers to mark an existing invoice as paid manually', async () => {
    const { service, prisma } = makeService('finance_officer', {
      id: 'invoice-1',
      amount: 50000,
      currency: 'USD',
    });

    await expect(
      service.recordManualPayment('actor-1', 'app-1', { reference: 'BANK-123', notes: 'Wire confirmed' }),
    ).resolves.toEqual({
      success: true,
      invoice: expect.objectContaining({ id: 'invoice-1' }),
      payment: { id: 'payment-1' },
    });

    expect(prisma.invoice.update).toHaveBeenCalledWith({
      where: { id: 'invoice-1' },
      data: { status: 'paid', paidAt: expect.any(Date) },
    });
    expect(prisma.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: 'manual',
        providerPaymentId: 'BANK-123',
        providerEventId: 'BANK-123',
        idempotencyKey: 'manual:invoice-1:BANK-123',
        processedBy: 'actor-1',
        status: 'completed',
      }),
    });
    expect(prisma.application.update).toHaveBeenCalledWith({
      where: { id: 'app-1' },
      data: { status: 'under_review' },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'payment_processed',
        entityType: 'payment',
      }),
    });
  });

  it('creates a paid invoice if manual payment arrives before checkout was generated', async () => {
    const { service, prisma } = makeService('super_admin');

    await service.recordManualPayment('actor-1', 'app-1', { reference: 'CASH-1' });

    expect(prisma.invoice.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        applicationId: 'app-1',
        amount: 50000,
        currency: 'USD',
        status: 'paid',
      }),
    });
  });

  it('blocks reviewers from manual payment processing', async () => {
    const { service } = makeService('reviewer');

    await expect(
      service.recordManualPayment('actor-1', 'app-1', { reference: 'BANK-123' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
