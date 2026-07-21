import { ForbiddenException } from '@nestjs/common';
import { AdminService } from '../src/admin/admin.service';

describe('AdminService reporting', () => {
  function makeService(role = 'super_admin') {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'actor-1',
          email: 'actor@example.com',
          firstName: 'Ada',
          lastName: 'Admin',
          role,
          isActive: true,
        }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'reviewer-1', email: 'reviewer@example.com', firstName: 'Rita', lastName: 'Reviewer' },
        ]),
      },
      application: {
        count: jest.fn()
          .mockResolvedValueOnce(100)
          .mockResolvedValueOnce(12),
        groupBy: jest.fn()
          .mockResolvedValueOnce([
            { status: 'submitted', _count: { _all: 9 } },
            { status: 'approved', _count: { _all: 60 } },
            { status: 'rejected', _count: { _all: 10 } },
          ])
          .mockResolvedValueOnce([
            { status: 'approved', _count: { _all: 60 } },
            { status: 'rejected', _count: { _all: 10 } },
          ])
          .mockResolvedValueOnce([
            { reviewedBy: 'reviewer-1', _count: { _all: 7 } },
          ]),
        findMany: jest.fn(),
      },
      $queryRaw: jest.fn().mockResolvedValue([{ averageDays: 4.25 }]),
      accreditation: {
        count: jest.fn()
          .mockResolvedValueOnce(22)
          .mockResolvedValueOnce(3),
      },
      institution: {
        groupBy: jest.fn().mockResolvedValue([
          { country: 'United States', _count: { _all: 8 } },
        ]),
      },
      applicationTrainingArea: {
        groupBy: jest.fn().mockResolvedValue([
          { trainingAreaId: 'ta-1', _count: { applicationId: 5 } },
        ]),
      },
      trainingArea: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'ta-1', name: 'Transport Safety', code: 'TS' },
        ]),
      },
      invoice: {
        groupBy: jest.fn().mockResolvedValue([
          { status: 'paid', currency: 'USD', _count: { _all: 4 }, _sum: { amount: 200000 } },
        ]),
      },
      payment: {
        aggregate: jest.fn().mockResolvedValue({ _count: { _all: 4 }, _sum: { amount: 200000 } }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
    } as any;

    return {
      prisma,
      service: new AdminService(prisma, {} as any, {} as any),
    };
  }

  it('blocks applicants from report summaries', async () => {
    const { service } = makeService('applicant');

    await expect(service.getReportSummary('actor-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('builds the dashboard summary from aggregate queries', async () => {
    const { service, prisma } = makeService();

    const summary = await service.getReportSummary('actor-1');

    expect(summary.pipeline.totalApplications).toBe(100);
    expect(summary.pipeline.newApplications30d).toBe(12);
    expect(summary.pipeline.averageReviewDays).toBe(4.25);
    expect(summary.pipeline.approvalRate).toBeCloseTo(0.8571);
    expect(summary.accreditations.expiringIn90Days).toBe(3);
    expect(summary.trainingAreas).toEqual([
      { id: 'ta-1', name: 'Transport Safety', code: 'TS', applications: 5 },
    ]);
    expect(summary.reviewers[0]).toEqual({
      id: 'reviewer-1',
      name: 'Rita Reviewer',
      email: 'reviewer@example.com',
      openReviews: 7,
    });
    expect(prisma.application.findMany).not.toHaveBeenCalled();
  });

  it('exports board CSV and records an audit log', async () => {
    const { service, prisma } = makeService('auditor');

    const csv = await service.exportReportCsv('actor-1');

    expect(csv).toContain('Total Applications,100');
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'actor-1',
        action: 'export_performed',
        entityType: 'report',
        metadata: { format: 'csv', report: 'board_summary' },
      }),
    });
  });

  it('exports a PDF buffer for board reporting', async () => {
    const { service } = makeService('auditor');

    const pdf = await service.exportReportPdf('actor-1');

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 8).toString()).toBe('%PDF-1.4');
  });
});
