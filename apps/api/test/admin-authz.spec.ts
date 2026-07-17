import { ForbiddenException } from '@nestjs/common';
import { AdminService } from '../src/admin/admin.service';

describe('AdminService authorization', () => {
  function makeService(role: string, active = true) {
    const prisma = {
      application: { findMany: jest.fn().mockResolvedValue([]) },
      institution: { findMany: jest.fn().mockResolvedValue([]) },
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }), findMany: jest.fn().mockResolvedValue([]) },
    } as any;

    prisma.user = {
      findUnique: jest.fn().mockResolvedValue({
        id: 'actor-1',
        email: 'actor@example.com',
        firstName: 'Ada',
        lastName: 'Admin',
        role,
        isActive: active,
        isTotpEnabled: true,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    };

    return {
      prisma,
      service: new AdminService(
        prisma,
        {
          transitionStatus: jest.fn().mockResolvedValue({ id: 'application-1' }),
          assignReviewer: jest.fn(),
          addComment: jest.fn(),
          createChecklistItem: jest.fn(),
          setChecklistItemCompleted: jest.fn(),
        } as any,
        { suspend: jest.fn(), reactivate: jest.fn() } as any,
      ),
    };
  }

  it('requires an admin role for the application queue', async () => {
    const { service } = makeService('applicant');

    await expect(service.listApplications('actor-1', {})).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows reviewers to transition applications', async () => {
    const { service } = makeService('reviewer');

    await expect(service.transitionApplication('actor-1', 'application-1', 'approved')).resolves.toEqual({
      id: 'application-1',
    });
  });

  it('requires export permission for CSV reports', async () => {
    const { service } = makeService('reviewer');

    await expect(service.exportInstitutionsCsv('actor-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('exports CSV only for authenticated export roles and writes an audit log', async () => {
    const { service, prisma } = makeService('auditor');

    await expect(service.exportInstitutionsCsv('actor-1')).resolves.toContain(
      'Name,Registration Number,Country,Email,Website,Accreditation Codes,Status',
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'actor-1',
        action: 'export_performed',
        entityType: 'institution',
      }),
    });
  });

  it('keeps audit logs read-only for auditor role', async () => {
    const { service } = makeService('auditor');

    await expect(service.listAuditLogs('actor-1')).resolves.toEqual([]);
    await expect(service.updateUser('actor-1', 'user-2', { role: 'reviewer' as any })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
