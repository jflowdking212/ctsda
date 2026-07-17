import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async getMyApplications(applicantId: string) {
    return this.prisma.application.findMany({
      where: { applicantId },
      include: { institution: { select: { name: true, country: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
