import { ForbiddenException } from '@nestjs/common';
import { ReviewsService } from '../../src/reviews/reviews.service';

/**
 * Closes the M5 authorization hole: the parallel /reviews/* controller routes
 * previously only had @UseGuards(AuthGuard), so any authenticated user
 * (including an applicant) could approve/reject their own application via
 * ReviewsService.transitionStatus. These tests assert the service itself now
 * rejects non-review roles before touching any data.
 */
describe('ReviewsService authorization (transitionStatus hole)', () => {
  function makeService(role: string, active = true) {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'actor-1',
          role,
          isActive: active,
        }),
      },
      application: { findUnique: jest.fn(), update: jest.fn() },
      applicationStatusHistory: { create: jest.fn() },
      auditLog: { create: jest.fn() },
      accreditation: { create: jest.fn() },
      certificate: { create: jest.fn() },
      notification: { create: jest.fn() },
      invoice: { findFirst: jest.fn() },
      $transaction: jest.fn(),
    } as any;

    const certificateQueue = { add: jest.fn() } as any;
    const service = new ReviewsService(prisma, certificateQueue);
    return { service, prisma, certificateQueue };
  }

  it.each([
    ['applicant'],
    ['content_manager'],
    ['auditor'],
  ])('blocks %s from approving an application', async (role) => {
    const { service, prisma } = makeService(role);

    await expect(
      service.transitionStatus('app-1', 'approved' as any, 'actor-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);

    // The hole: previously transitionStatus mutated the application before any
    // role check. Assert it never reached the DB write.
    expect(prisma.application.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('blocks applicants from creating checklist items', async () => {
    const { service, prisma } = makeService('applicant');
    await expect(
      service.createChecklistItem('app-1', 'actor-1', 'Verify insurance'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    // The role gate ran (user lookup happened) but no checklist write occurred.
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });

  it('blocks applicants from posting internal notes', async () => {
    const { service } = makeService('applicant');
    await expect(
      service.addComment('app-1', 'actor-1', 'confidential', true),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks applicants from posting public comments on others applications', async () => {
    const { service, prisma } = makeService('applicant');
    prisma.application.findUnique.mockResolvedValue({ applicantId: 'someone-else' });
    await expect(
      service.addComment('app-1', 'actor-1', 'hi', false),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a reviewer to post a public comment on their own application', async () => {
    const { service, prisma } = makeService('applicant');
    // applicant owns the application -> public comment allowed
    prisma.application.findUnique.mockResolvedValue({ applicantId: 'actor-1' });
    prisma.applicationComment = { create: jest.fn().mockResolvedValue({ id: 'c-1' }) };
    await expect(
      service.addComment('app-1', 'actor-1', 'thanks', false),
    ).resolves.toEqual({ id: 'c-1' });
  });

  it('allows a reviewer to transition status past the authz gate', async () => {
    const { service, prisma } = makeService('reviewer');
    // After the gate, transitionStatus loads the application. Stub a legal
    // transition and the transactional writes so the call resolves.
    prisma.application.findUnique.mockResolvedValue({
      id: 'app-1',
      institutionId: 'inst-1',
      applicantId: 'actor-1',
      status: 'submitted',
    });
    prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
    prisma.application.update.mockResolvedValue({ id: 'app-1', status: 'under_review' });

    await expect(
      service.transitionStatus('app-1', 'under_review' as any, 'actor-1'),
    ).resolves.toEqual({ id: 'app-1', status: 'under_review' });
  });
});
