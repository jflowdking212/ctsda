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

  it.each([
    ['transition applications', (service: AdminService) => service.transitionApplication('actor-1', 'application-1', 'approved')],
    ['assign reviewers', (service: AdminService) => service.assignReviewer('actor-1', 'application-1', 'reviewer-1')],
    ['add comments', (service: AdminService) => service.addComment('actor-1', 'application-1', 'Internal note')],
    ['create checklist items', (service: AdminService) => service.createChecklistItem('actor-1', 'application-1', 'Policy review')],
    ['update checklist items', (service: AdminService) => service.setChecklistItem('actor-1', 'item-1', true)],
    ['update reviewer notes', (service: AdminService) => service.updateReviewerNotes('actor-1', 'application-1', 'Notes')],
    ['update institutions', (service: AdminService) => service.updateInstitution('actor-1', 'institution-1', { logoUrl: 'https://example.com/logo.png' })],
    ['suspend accreditations', (service: AdminService) => service.suspendAccreditation('actor-1', 'accreditation-1')],
    ['reactivate accreditations', (service: AdminService) => service.reactivateAccreditation('actor-1', 'accreditation-1')],
    ['update users', (service: AdminService) => service.updateUser('actor-1', 'user-2', { role: 'reviewer' as any })],
    ['record manual payments', (service: AdminService) => service.recordManualPayment('actor-1', 'application-1', { reference: 'BANK-1' })],
    ['create admin users', (service: AdminService) => service.createAdminUser('actor-1', { email: 'new@example.com', firstName: 'New', lastName: 'Admin', role: 'reviewer' as any })],
    ['seed legacy accredited institutions', (service: AdminService) => service.createLegacyAccreditedInstitution('actor-1', {
      name: 'Legacy Institution',
      registrationNumber: 'LEG-1',
      institutionType: 'training',
      country: 'US',
      address: 'Address',
      phone: '123',
      email: 'legacy@example.com',
      accreditationCode: 'CTSDA-628356-TG',
      certificateNumber: 'CTSDA-628356-TG',
    })],
  ])('blocks applicants from %s', async (_label, call) => {
    const { service } = makeService('applicant');

    await expect(call(service)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
