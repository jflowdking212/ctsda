import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../common/prisma.service';
import { z } from 'zod';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  institution: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(5, 'Message is required'),
});

@Controller('contact')
export class ContactController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService
  ) {}

  @Post()
  async submitContact(@Body() body: any) {
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpException(parsed.error.errors[0].message, HttpStatus.BAD_REQUEST);
    }
    const data = parsed.data;

    // Get the admin email from settings (or fallback to support)
    const siteSettings = await this.prisma.siteSetting.findMany();
    const adminEmail = siteSettings.find(s => s.key === 'contactEmail')?.value || 'ctsdausa@gmail.com';

    // Construct the HTML email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Institution:</strong> ${data.institution || 'N/A'}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px;">${data.message}</p>
      </div>
    `;

    // Send the email to the admin
    await this.notificationsService.enqueueEmail({
      to: adminEmail as string,
      subject: `[CTSDA Contact] ${data.subject} - ${data.fullName}`,
      html: html,
    });

    return { success: true, message: 'Message sent successfully.' };
  }
}
