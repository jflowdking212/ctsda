import { Controller, Get, Param, Request } from '@nestjs/common';
import { ReviewsService } from '../reviews/reviews.service';
import { StudentsService } from '../students/students.service';

@Controller('verify')
export class VerifyController {
  constructor(
    private reviewsService: ReviewsService,
    private studentsService: StudentsService,
  ) {}

  @Get(':token')
  async verify(@Param('token') token: string, @Request() req: any) {
    let cert = await this.reviewsService.findCertificateByToken(token);

    if (!cert) {
      const studentCert = await this.studentsService.findByCertificateNumberOrToken(token);
      if (studentCert) {
        const isExpired = studentCert.expiryDate && new Date(studentCert.expiryDate) < new Date();
        const isValid = studentCert.status === 'active' && !isExpired;

        return {
          valid: isValid,
          message: isValid ? 'Student Certificate is authentic and valid' : `Student Certificate status: ${studentCert.status}`,
          recipientName: studentCert.studentName,
          courseProgram: studentCert.courseProgram,
          institution: studentCert.institutionName,
          certificateNumber: studentCert.certificateNumber,
          grade: studentCert.grade,
          issueDate: studentCert.issueDate,
          expiryDate: studentCert.expiryDate,
          status: studentCert.status,
          qrCodeUrl: studentCert.qrCodeUrl,
        };
      }
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
