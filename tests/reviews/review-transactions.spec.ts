import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from '../../apps/api/src/reviews/reviews.service';
import { PrismaService } from '../../apps/api/src/common/prisma.service';

describe('Review Engine - Payment Gate & Approval Transactionality', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, PrismaService],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('blocks under_review transition when invoice unpaid', async () => {
    const findAppSpy = jest.spyOn(prisma.application, 'findUnique').mockResolvedValue({
      id: 'app-2',
      institutionId: 'inst-1',
      status: 'payment_pending',
    } as any);

    const findInvoiceSpy = jest.spyOn(prisma.invoice, 'findFirst').mockResolvedValue(null);

    await expect(service.transitionStatus('app-2', 'under_review', 'user-1')).rejects.toThrow('Invoice must be paid before review');
    expect(findInvoiceSpy).toHaveBeenCalledWith({ where: { applicationId: 'app-2', status: 'paid' } });
  });

  it('creates accreditation and certificate atomically on approval', async () => {
    const findAppSpy = jest.spyOn(prisma.application, 'findUnique').mockResolvedValue({
      id: 'app-3',
      institutionId: 'inst-1',
      status: 'under_review',
    } as any);

    const invoiceSpy = jest.spyOn(prisma.invoice, 'findFirst').mockResolvedValue({ status: 'paid' } as any);
    const updateAppSpy = jest.spyOn(prisma.application, 'update').mockResolvedValue({ id: 'app-3', status: 'approved' } as any);
    const createHistorySpy = jest.spyOn(prisma.applicationStatusHistory, 'create').mockResolvedValue({} as any);
    const createAuditSpy = jest.spyOn(prisma.auditLog, 'create').mockResolvedValue({} as any);
    const createAccSpy = jest.spyOn(prisma.accreditation, 'create').mockResolvedValue({ id: 'acc-1' } as any);
    const createCertSpy = jest.spyOn(prisma.certificate, 'create').mockResolvedValue({ id: 'cert-1' } as any);

    await service.transitionStatus('app-3', 'approved', 'user-1');

    expect(createAccSpy).toHaveBeenCalled();
    expect(createCertSpy).toHaveBeenCalled();
    expect(createHistorySpy).toHaveBeenCalled();
    expect(createAuditSpy).toHaveBeenCalled();
  });
});