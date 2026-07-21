import { Injectable, BadRequestException } from '@nestjs/common';
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
      const strValue = String(value);
      await this.prisma.siteSetting.upsert({
        where: { key },
        update: { value: strValue },
        create: { key, value: strValue },
      });
    }
    return this.getAll();
  }

  async testSmtp(config: Record<string, any>) {
    const nodemailer = require('nodemailer');
    
    let pass = config.smtpPassword;
    if (!pass) {
      const existing = await this.getAll();
      pass = existing.smtpPassword;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort),
      secure: config.smtpSecure === 'true',
      auth: {
        user: config.smtpUser,
        pass: pass,
      },
    });

    try {
      await transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (err: any) {
      throw new BadRequestException(`SMTP test failed: ${err.message}`);
    }
  }
}
