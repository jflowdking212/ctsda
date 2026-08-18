import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

const DEFAULT_PAGE_SETTINGS: Record<string, string> = {
  showDirectory: 'true',
  homeHeroBadge: 'Official International Accreditation Body',
  homeHeroTitle: 'Council For Training Skills & Development America (CTSDA)',
  homeHeroSubtitle: 'Empowering global education and workforce training providers with rigorous quality standards, international recognition, and 100% verifiable digital credentials.',
  homeFrameworkTitle: 'Global Quality Benchmark',
  homeFrameworkSubtitle: 'CTSDA sets international standards for vocational, technical, and executive training providers worldwide.',
  aboutHeroSubtitle: 'Empowering educational excellence through comprehensive accreditation services since 2010.',
  aboutMissionText: 'The Council For Training Skills and Development America (CTSDA) is dedicated to advancing excellence in education and training through comprehensive accreditation services. We strive to empower institutions, trainers and educational service providers to deliver high-quality programs that meet the evolving needs of learners and industries.',
  aboutVisionText: 'We envision a world where every learner has access to quality education and training, fostering personal growth, professional development, and societal progress. CTSDA aims to be the leading accreditation body, setting the gold standard for educational excellence and innovation.',
  servicesHeroSubtitle: 'Comprehensive accreditation solutions designed to elevate educational standards and ensure excellence in learning.',
  servicesOverviewText: 'At CTSDA, we offer specialized accreditation and evaluation services tailored to educational institutions, vocational training centers, and corporate learning providers.',
  trainingHeroSubtitle: 'Browse free training modules, videos, and resources from the CTSDA to improve road safety and driver training standards.',
  blogHeroSubtitle: 'Latest insights, accreditation standards, educational news, and industry updates from CTSDA.',
  contactHeroSubtitle: 'We are here to assist institutions, educators, applicants, and the public with accreditation, verification, and partnership inquiries.',
  contactIntroText: 'Reach out directly to our dedicated support team for assistance.',
  contactEmail: 'support@ctsdamerica.com',
  contactLegalEmail: 'management@ctsdamerica.com',
  contactPhone: '+1 (302) 555-0199',
  contactAddress: 'The Green, STE A, Dover, Kent, Delaware, United States',
  contactHours: 'Monday - Friday: 9:00 AM - 5:00 PM EST',
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.siteSetting.findMany();
    const result: Record<string, any> = { ...DEFAULT_PAGE_SETTINGS };
    for (const setting of settings) {
      if (setting.value !== null && setting.value !== undefined && String(setting.value).trim() !== '') {
        result[setting.key] = setting.value;
      }
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
