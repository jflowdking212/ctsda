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
    
    let pass = config.smtpPassword;
    if (!pass) {
      const existing = await this.getAll();
      pass = existing.smtpPassword;
    }

    const port = Number(config.smtpPort) || 587;

    // Determine security mode: 465 expects implicit SSL (secure: true); 587/25 expect STARTTLS (secure: false)
    let isSecure = false;
    if (config.smtpSecure === 'true' || config.smtpSecure === true || config.smtpSecure === 'ssl') {
      isSecure = true;
    } else if (config.smtpSecure === 'false' || config.smtpSecure === false || config.smtpSecure === 'tls') {
      isSecure = false;
    } else {
      isSecure = port === 465;
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: port,
      secure: isSecure,
      auth: {
        user: config.smtpUser,
        pass: pass,
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
