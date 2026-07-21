import { BadRequestException } from '@nestjs/common';
import { AdminService } from '../src/admin/admin.service';

jest.mock('argon2', () => ({
  hash: jest.fn(async () => 'hashed-temp-password'),
}));

describe('AdminService legacy seed and admin onboarding', () => {
  function makeService() {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'actor-1',
          role: 'super_admin',
          isActive: true,
        }),
        create: jest.fn().mockResolvedValue({
          id: 'admin-2',
          email: 'reviewer@example.com',
          firstName: 'Rita',
          lastName: 'Reviewer',
          role: 'reviewer',
          forcePasswordReset: true,
          isTotpEnabled: false,
        }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
      $transaction: jest.fn(async (cb: any) => cb(prisma)),
      institution: { create: jest.fn().mockResolvedValue({ id: 'inst-1', name: 'Ace Coterie Consulting' }) },
      application: { create: jest.fn().mockResolvedValue({ id: 'app-1' }) },
      accreditation: { create: jest.fn().mockResolvedValue({ id: 'acc-1', accreditationCode: 'CTSDA-628356-TG' }) },
      certificate: { create: jest.fn().mockResolvedValue({ id: 'cert-1', certificateNumber: 'CTSDA-628356-TG' }) },
    } as any;

    return { prisma, service: new AdminService(prisma, {} as any, {} as any) };
  }

  it('creates fresh admin accounts with reset and TOTP enrollment required', async () => {
    const { service, prisma } = makeService();

    const result = await service.createAdminUser('actor-1', {
      email: 'reviewer@example.com',
      firstName: 'Rita',
      lastName: 'Reviewer',
      role: 'reviewer' as any,
    });

    expect(result.user.forcePasswordReset).toBe(true);
    expect(result.passwordResetToken).toEqual(expect.any(String));
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'reviewer@example.com',
        role: 'reviewer',
        passwordHash: 'hashed-temp-password',
        isEmailVerified: true,
        forcePasswordReset: true,
        passwordResetToken: expect.any(String),
        passwordResetExpiresAt: expect.any(Date),
      }),
      select: expect.any(Object),
    });
  });

  it('does not create applicant accounts from the admin user endpoint', async () => {
    const { service } = makeService();

    await expect(
      service.createAdminUser('actor-1', {
        email: 'applicant@example.com',
        firstName: 'App',
        lastName: 'Licant',
        role: 'applicant' as any,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('manually seeds reviewed accredited institutions with preserved codes', async () => {
    const { service, prisma } = makeService();

    await service.createLegacyAccreditedInstitution('actor-1', {
      name: 'Ace Coterie Consulting',
      registrationNumber: 'ACE-1',
      institutionType: 'consulting',
      country: 'United States',
      address: 'Reviewed address',
      phone: '+1 000 000 0000',
      email: 'info@example.com',
      accreditationCode: 'CTSDA-628356-TG',
      certificateNumber: 'CTSDA-628356-TG',
    });

    expect(prisma.institution.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Ace Coterie Consulting',
        slug: 'ace-coterie-consulting',
        createdBy: 'actor-1',
      }),
    });
    expect(prisma.accreditation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        accreditationCode: 'CTSDA-628356-TG',
        status: 'active',
      }),
    });
    expect(prisma.certificate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        certificateNumber: 'CTSDA-628356-TG',
        status: 'active',
      }),
    });
  });
});
