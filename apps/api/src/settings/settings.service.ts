import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.siteSetting.findMany();
    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  }

  async getPublicSettings() {
    const settings = await this.getAll();
    const publicSettings: Record<string, any> = {};
    const hiddenKeys = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'smtpSecure'];
    for (const [k, v] of Object.entries(settings)) {
      if (!hiddenKeys.includes(k)) {
        publicSettings[k] = v;
      }
    }
    return publicSettings;
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
    
    const existing = await this.getAll();
    const host = config.smtpHost || existing.smtpHost || process.env.SMTP_HOST || 'mail.acecoterieconsulting.com';
    const port = Number(config.smtpPort || existing.smtpPort || process.env.SMTP_PORT) || 587;
    const user = config.smtpUser || existing.smtpUser || process.env.SMTP_USER || 'accounts@acecoterieconsulting.com';
    const pass = config.smtpPassword || existing.smtpPassword || process.env.SMTP_PASS || 'Preciouskey2030';
    const rawSecure = config.smtpSecure ?? existing.smtpSecure;

    let isSecure = false;
    if (rawSecure === 'true' || rawSecure === true || rawSecure === 'ssl') {
      isSecure = true;
    } else if (rawSecure === 'false' || rawSecure === false || rawSecure === 'tls') {
      isSecure = false;
    } else {
      isSecure = port === 465;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
    });

    try {
      await transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (err: any) {
      throw new BadRequestException(`SMTP test failed: ${err.message}`);
    }
  }
}
