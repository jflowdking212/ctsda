import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import IORedis from 'ioredis';

@Injectable()
export class TrainingService {
  private redis: IORedis;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.redis = new IORedis(this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'));
  }

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
    const { id, createdAt, updatedAt, enrollments, ...rest } = data;
    const clean = this.sanitize(rest);
    return this.prisma.training.create({ data: clean });
  }

  async update(id: string, data: any) {
    const { id: _id, createdAt, updatedAt, enrollments, ...rest } = data;
    const clean = this.sanitize(rest);
    return this.prisma.training.update({ where: { id }, data: clean });
  }

  private sanitize(data: any) {
    return {
      title: data.title ?? undefined,
      description: data.description || undefined,
      category: data.category || undefined,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      resourceUrl: data.resourceUrl || null,
      duration: data.duration ? String(data.duration) : null,
      price: data.price !== undefined ? Number(data.price) : 0,
      isPublished: typeof data.isPublished === 'boolean' ? data.isPublished : false,
    };
  }

  async remove(id: string) {
    return this.prisma.training.delete({ where: { id } });
  }

  async generateCaptcha() {
    const isAddition = Math.random() > 0.35;
    let num1: number;
    let num2: number;
    let question: string;
    let answer: number;

    if (isAddition) {
      num1 = Math.floor(Math.random() * 12) + 2; // 2 to 13
      num2 = Math.floor(Math.random() * 9) + 1;  // 1 to 9
      question = `What is ${num1} + ${num2} = ?`;
      answer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * 12) + 8; // 8 to 19
      num2 = Math.floor(Math.random() * 6) + 1;  // 1 to 6
      question = `What is ${num1} - ${num2} = ?`;
      answer = num1 - num2;
    }

    const captchaId = randomUUID();
    // Expire challenge in 5 minutes (300 seconds)
    await this.redis.set(`captcha:training:${captchaId}`, String(answer), 'EX', 300);

    return {
      captchaId,
      question,
    };
  }

  async register(
    userId: string | null,
    trainingId: string,
    email: string | null = null,
    name: string | null = null,
    captchaId?: string,
    captchaAnswer?: string,
    _honeypot?: string,
    _clientTime?: number,
    clientIp?: string,
  ) {
    // 1. Name & Email validation
    const userName = (name || '').trim();
    const userEmail = (email || '').trim().toLowerCase();
    if (!userName || userName.length < 2) {
      throw new BadRequestException('Please enter your full name.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail || !emailRegex.test(userEmail)) {
      throw new BadRequestException('Please provide a valid email address.');
    }

    // 2. IP Rate Limiting (max 10 registration requests per 10 minutes per IP)
    if (clientIp) {
      const cleanIp = String(clientIp).split(',')[0].trim();
      const ipKey = `ratelimit:training_reg:${cleanIp}`;
      const count = await this.redis.incr(ipKey);
      if (count === 1) {
        await this.redis.expire(ipKey, 600); // 10 minutes
      }
      if (count > 10) {
        throw new BadRequestException('Too many registration requests from this network. Please wait a few minutes before trying again.');
      }
    }

    // 3. Captcha Verification (Required for all guest / unauthenticated requests)
    if (!userId) {
      if (!captchaId || !captchaAnswer || !captchaAnswer.trim()) {
        throw new BadRequestException('Security verification is required. Please solve the math challenge.');
      }

      const expectedAnswer = await this.redis.get(`captcha:training:${captchaId}`);
      if (!expectedAnswer) {
        throw new BadRequestException('Security verification expired or invalid. Please refresh the question.');
      }

      // Immediately delete token to prevent replay attacks
      await this.redis.del(`captcha:training:${captchaId}`);

      if (captchaAnswer.trim() !== expectedAnswer.trim()) {
        throw new BadRequestException('Incorrect security verification answer. Please try again.');
      }
    }

    const training = await this.prisma.training.findUnique({
      where: { id: trainingId }
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const adminEmail = 'ctsdausa@gmail.com';
    const subject = `New Training Enrollment Request: ${training.title}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
        <h2 style="color: #0f172a;">New Training Enrollment Request</h2>
        <p>A new user has requested to enroll in a training module.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${userEmail}">${userEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Module:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${training.title}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Price:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">$${training.price}</td>
          </tr>
        </table>
        
        <p>Please contact them directly to provide the payment link or enrollment instructions.</p>
      </div>
    `;

    // Queue the email to be sent by the worker
    await this.emailQueue.add('send-email', {
      to: adminEmail,
      subject,
      html,
      userId: userId || 'system',
    });

    return { 
      success: true, 
      message: 'Your registration request has been received. An admin will contact you with payment instructions shortly.' 
    };
  }

  async getMyEnrollments(userId: string) {
    return this.prisma.trainingEnrollment.findMany({
      where: { userId },
      include: { training: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
