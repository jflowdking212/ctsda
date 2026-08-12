import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TrainingService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

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

  async register(userId: string | null, trainingId: string, email: string | null = null, name: string | null = null) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId }
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    const adminEmail = 'ctsdausa@gmail.com';
    const userName = name || 'A user';
    const userEmail = email || 'Unknown email';

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
