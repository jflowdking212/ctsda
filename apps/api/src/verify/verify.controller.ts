import { Controller, Get, Param, Request } from '@nestjs/common';
import { ReviewsService } from '../reviews/reviews.service';

@Controller('verify')
export class VerifyController {
  constructor(private reviewsService: ReviewsService) {}

  @Get(':token')
  async verify(@Param('token') token: string, @Request() req: any) {
    const cert = await this.reviewsService.findCertificateByToken(token);

    if (!cert) {
      return { valid: false, message: 'Certificate not found' };
    }

    await this.reviewsService.logVerificationEvent(cert.id, req.ip, req.headers['user-agent']);

    const now = new Date();

    if (cert.accreditation.status !== 'active') {
      return {
        valid: false,
        message: `Accreditation is ${cert.accreditation.status}`,
        institution: cert.accreditation.institution.name,
        certificateNumber: cert.certificateNumber,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
      };
    }

    if (cert.expiryDate < now) {
      return {
        valid: false,
        message: 'Certificate expired',
        institution: cert.accreditation.institution.name,
        certificateNumber: cert.certificateNumber,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
      };
    }

    const applicant = cert.accreditation?.application?.applicant;
    const recipientName = applicant && (applicant.firstName || applicant.lastName)
      ? `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim()
      : cert.accreditation?.institution?.name || 'Accredited Institution';

    const certsOffered = cert.accreditation?.application?.certificatesOffered;
    const trainingAreas = cert.accreditation?.application?.trainingAreas;
    const courseProgram = (Array.isArray(certsOffered) && certsOffered.length > 0)
      ? certsOffered.join(', ')
      : (trainingAreas && trainingAreas.length > 0)
      ? trainingAreas.map((t: any) => t.trainingArea?.name || t.trainingAreaId).join(', ')
      : 'Institutional Accreditation & Quality Standards';

    return {
      valid: true,
      message: 'Certificate is valid',
      institution: cert.accreditation.institution.name,
      registrationNumber: cert.accreditation.institution.registrationNumber,
      country: cert.accreditation.institution.country,
      certificateNumber: cert.certificateNumber,
      recipientName,
      courseProgram,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
    };
  }
}
