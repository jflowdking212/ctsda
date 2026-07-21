import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  private prisma = new PrismaClient();

  async listSubscriptions() {
    return this.prisma.subscription.findMany({
      include: { institution: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listOrders() {
    return this.prisma.order.findMany({
      include: { institution: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createManualOrder(data: any) {
    return this.prisma.order.create({
      data: {
        institutionId: data.institutionId,
        amount: data.amount,
        currency: data.currency || 'USD',
        status: data.status || 'pending',
        description: data.description,
        isManual: true,
      },
    });
  }
}
