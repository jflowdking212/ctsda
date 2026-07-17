import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AccreditationsService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const accreditation = await this.prisma.accreditation.findUnique({
      where: { id },
      include: { institution: true, certificates: true },
    });

    if (!accreditation) {
      throw new NotFoundException('Accreditation not found');
    }

    return accreditation;
  }

  async listActive() {
    return this.prisma.accreditation.findMany({
      where: { status: 'active' },
      include: { institution: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async suspend(id: string, actorId: string, reason?: string) {
    await this.assertAccreditationAdmin(actorId);
    const accreditation = await this.findById(id);
    if (accreditation.status !== 'active') {
      throw new BadRequestException('Only active accreditations can be suspended');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.accreditation.update({
        where: { id },
        data: { status: 'suspended', suspendedAt: new Date() },
      });

      await tx.certificate.updateMany({
        where: { accreditationId: id },
        data: { status: 'suspended' },
      });

      await tx.certificateStatusHistory.create({
        data: {
          accreditationId: id,
          fromStatus: 'active',
          toStatus: 'suspended',
          changedBy: actorId,
          reason,
        },
      });

      return updated;
    });
  }

  async reactivate(id: string, actorId: string, reason?: string) {
    await this.assertAccreditationAdmin(actorId);
    const accreditation = await this.findById(id);
    if (accreditation.status !== 'suspended') {
      throw new BadRequestException('Only suspended accreditations can be reactivated');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.accreditation.update({
        where: { id },
        data: { status: 'active', suspendedAt: null },
      });

      await tx.certificate.updateMany({
        where: { accreditationId: id },
        data: { status: 'active' },
      });

      await tx.certificateStatusHistory.create({
        data: {
          accreditationId: id,
          fromStatus: 'suspended',
          toStatus: 'active',
          changedBy: actorId,
          reason,
        },
      });

      return updated;
    });
  }

  private async assertAccreditationAdmin(actorId: string) {
    const actor = await this.prisma.user.findUnique({ where: { id: actorId } });
    if (!['super_admin', 'support_officer'].includes(actor?.role || '')) {
      throw new ForbiddenException('Only admins can manage accreditation status');
    }
  }
}
