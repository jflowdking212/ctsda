import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from '../../apps/api/src/reviews/reviews.service';
import { PrismaService } from '../../apps/api/src/common/prisma.service';

describe('Review Engine - State Machine', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, PrismaService],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('allows draft -> submitted', async () => {
    const findApp = jest.spyOn(prisma.application, 'findUnique').mockResolvedValue({
      id: 'app-1',
      institutionId: 'inst-1',
      status: 'draft',
    } as any);
    const updateApp = jest.spyOn(prisma.application, 'update').mockResolvedValue({ status: 'submitted' } as any);
    const createHistory = jest.spyOn(prisma.applicationStatusHistory, 'create').mockResolvedValue({} as any);
    const createAudit = jest.spyOn(prisma.auditLog, 'create').mockResolvedValue({} as any);

    await service.transitionStatus('app-1', 'submitted', 'user-1');
    expect(updateApp).toHaveBeenCalled();
    expect(createHistory).toHaveBeenCalled();
    expect(createAudit).toHaveBeenCalled();
  });

  it('rejects illegal transition draft -> approved', async () => {
    const findApp = jest.spyOn(prisma.application, 'findUnique').mockResolvedValue({
      id: 'app-1',
      institutionId: 'inst-1',
      status: 'draft',
    } as any);

    await expect(service.transitionStatus('app-1', 'approved', 'user-1')).rejects.toThrow();
  });
});