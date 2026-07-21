import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SettingsService {
  private prisma = new PrismaClient();

  async getAll() {
    const settings = await this.prisma.siteSetting.findMany();
    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async updateAll(settings: Record<string, any>) {
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return this.getAll();
  }
}
