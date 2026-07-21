import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic() {
    return this.prisma.training.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.training.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.training.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Training item not found');
    return item;
  }

  async create(data: any) {
    return this.prisma.training.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.training.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.training.delete({ where: { id } });
  }
}
