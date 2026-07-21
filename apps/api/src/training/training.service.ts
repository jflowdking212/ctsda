import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async register(userId: string | null, trainingId: string, email: string | null = null) {
    const training = await this.prisma.training.findUnique({
      where: { id: trainingId }
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    let actualUserId = userId;

    if (!actualUserId && email) {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return { requiresLogin: true, message: 'An account with this email already exists. Please log in to continue.' };
      }
    }

    if (!actualUserId && !email) {
      throw new BadRequestException('Must provide either userId or email');
    }

    // If we have a user ID, check existing enrollments
    if (actualUserId) {
      const existing = await this.prisma.trainingEnrollment.findUnique({
        where: { userId_trainingId: { userId: actualUserId, trainingId } }
      });

      if (existing && existing.status === 'paid') {
        return { url: null, message: 'Already enrolled' };
      }
      if (existing && existing.status === 'free') {
        return { url: null, message: 'Already enrolled' };
      }
    }

    const priceNum = Number(training.price);
    
    if (priceNum === 0) {
      // Free training
      if (!actualUserId && email) {
        // Create user for free training
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
        const newUser = await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            firstName: 'Guest',
            lastName: 'User',
            role: 'applicant',
            isActive: true,
          }
        });
        actualUserId = newUser.id;
      }

      await this.prisma.trainingEnrollment.upsert({
        where: { userId_trainingId: { userId: actualUserId!, trainingId } },
        update: { status: 'free', amountPaid: 0 },
        create: {
          userId: actualUserId!,
          trainingId,
          status: 'free',
          amountPaid: 0,
        }
      });
      return { url: null, status: 'free' };
    } else {
      // Paid training
      let enrollmentId: string | null = null;
      if (actualUserId) {
        const enrollment = await this.prisma.trainingEnrollment.upsert({
          where: { userId_trainingId: { userId: actualUserId, trainingId } },
          update: { status: 'pending', amountPaid: priceNum },
          create: {
            userId: actualUserId,
            trainingId,
            status: 'pending',
            amountPaid: priceNum,
          }
        });
        enrollmentId = enrollment.id;
      }

      // Generate Stripe checkout
      const Stripe = require('stripe');
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) throw new Error('Stripe is not configured');
      const stripe = new Stripe(secretKey);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        success_url: `${frontendUrl}/portal/training?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/training`,
        customer_email: email || undefined,
        metadata: {
          trainingId,
          ...(enrollmentId ? { trainingEnrollmentId: enrollmentId } : {}),
          ...(actualUserId ? { userId: actualUserId } : {}),
          ...(email ? { guestEmail: email } : {}),
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(priceNum * 100), // convert to cents
              product_data: {
                name: `Training: ${training.title}`,
              },
            },
          },
        ],
      });

      return { url: session.url, sessionId: session.id };
    }
  }

  async getMyEnrollments(userId: string) {
    return this.prisma.trainingEnrollment.findMany({
      where: { userId },
      include: { training: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
