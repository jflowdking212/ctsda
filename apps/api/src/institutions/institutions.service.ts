import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class InstitutionsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async createPreRegistration(data: { email: string; institutionId?: string }) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.prisma.preRegistration.create({
      data: {
        email: data.email.toLowerCase(),
        institutionId: data.institutionId,
        token,
        expiresAt,
      },
    });
  }

  async validatePreRegistration(token: string) {
    const preRegistration = await this.prisma.preRegistration.findUnique({
      where: { token },
    });
    if (!preRegistration || preRegistration.usedAt || preRegistration.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired pre-registration token');
    }

    return preRegistration;
  }

  async findPublicAccredited() {
    const institutions = await this.prisma.institution.findMany({
      where: {
        applications: {
          some: {
            status: 'approved'
          }
        },
        logoUrl: { not: null }
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
      },
      take: 10,
    });

    return Promise.all(institutions.map(async (inst) => ({
      ...inst,
      logoUrl: inst.logoUrl ? await this.storageService.getSignedUrl(inst.logoUrl) : null,
    })));
  }

  async findAll() {
    return this.prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        registrationNumber: true,
        institutionType: true,
        country: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getTrainingAreas() {
    const officialAreas = [
      { code: 'LEADERSHIP-MGMT', name: 'Leadership, Governance & Management', description: 'Executive leadership, governance frameworks, and strategic management' },
      { code: 'HR-MGMT', name: 'Human Resource Management', description: 'Talent management, HR operations, and organizational development' },
      { code: 'PROJECT-MGMT', name: 'Project Management', description: 'Project planning, agile methodologies, and program execution' },
      { code: 'FINANCE-PROCURE', name: 'Finance, Accounting & Procurement', description: 'Financial management, corporate accounting, auditing, and procurement' },
      { code: 'BUSINESS-ENTR', name: 'Business & Entrepreneurship', description: 'Business strategy, startup incubation, and commercial development' },
      { code: 'IT-DIGITAL', name: 'Information Technology & Digital Skills', description: 'Software development, cybersecurity, cloud computing, and digital literacy' },
      { code: 'HSE-HEALTH', name: 'Health, Safety & Environment (HSE)', description: 'Occupational health, workplace safety, hazard management, and environmental compliance' },
      { code: 'ENG-TECH', name: 'Engineering & Technical Training', description: 'Industrial engineering, technical trades, automotive, and mechanical operations' },
      { code: 'EDU-TRAIN', name: 'Education & Training', description: 'Pedagogy, instructional design, educator certification, and training methodology' },
      { code: 'RESEARCH-EVAL', name: 'Research, Monitoring & Evaluation', description: 'Data research methodologies, impact assessment, monitoring, and evaluation' },
      { code: 'COMM-SOFT', name: 'Communication & Soft Skills', description: 'Corporate communication, public speaking, negotiation, and interpersonal skills' },
      { code: 'LEGAL-RISK', name: 'Legal, Compliance & Risk Management', description: 'Regulatory compliance, legal frameworks, corporate governance, and risk mitigation' },
    ];

    try {
      await Promise.all(
        officialAreas.map((area) =>
          this.prisma.trainingArea.upsert({
            where: { code: area.code },
            update: { name: area.name, description: area.description, isActive: true },
            create: { name: area.name, code: area.code, description: area.description, isActive: true },
          })
        )
      );
    } catch (_err) {
      // Ignore concurrency conflict if seeded in parallel
    }

    // Return active training areas (or official ones sorted)
    return this.prisma.trainingArea.findMany({
      where: {
        code: { in: officialAreas.map(a => a.code) },
        isActive: true
      },
      select: { id: true, name: true, code: true, description: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.institution.findUnique({
      where: { id },
      include: {
        contacts: true,
        socialLinks: true,
        trainingAreas: { include: { trainingArea: true } },
      },
    });
  }

  async createInstitution(data: {
    name: string;
    registrationNumber: string;
    institutionType: string;
    country: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    yearEstablished?: number;
    description?: string;
    createdBy?: string;
    contacts: Array<{
      fullName: string;
      position: string;
      email: string;
      phone: string;
      isPrimary: boolean;
    }>;
    socialLinks?: Array<{ platform: string; url: string }>;
    trainingAreaIds?: string[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existing = await tx.institution.findFirst({
        where: { OR: [{ registrationNumber: data.registrationNumber }, { slug }] },
      });
      if (existing) {
        throw new ConflictException('Institution with this registration number or name already exists');
      }

      const institution = await tx.institution.create({
        data: {
          name: data.name,
          slug,
          registrationNumber: data.registrationNumber,
          institutionType: data.institutionType,
          country: data.country,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          yearEstablished: data.yearEstablished,
          description: data.description,
          createdBy: data.createdBy,
          contacts: { create: data.contacts.map((c) => ({ ...c, id: uuidv4() })) },
          socialLinks: data.socialLinks?.length
            ? { create: data.socialLinks.map((s) => ({ ...s, id: uuidv4() })) }
            : undefined,
          trainingAreas: data.trainingAreaIds?.length
            ? { create: data.trainingAreaIds.map((taId) => ({ trainingAreaId: taId })) }
            : undefined,
        },
        include: { contacts: true, socialLinks: true, trainingAreas: true },
      });

      return institution;
    });
  }

  async createApplication(data: {
    institutionId: string;
    applicantId: string;
    preRegistrationToken?: string;
    trainingAreaIds: string[];
    certificatesOffered: string[];
    deliveryMethods: string[];
    staffingCount?: number;
    operationalInfo?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      if (data.preRegistrationToken) {
        const preRegistration = await tx.preRegistration.findUnique({
          where: { token: data.preRegistrationToken },
        });
        if (!preRegistration || preRegistration.usedAt || preRegistration.expiresAt < new Date()) {
          throw new BadRequestException('Invalid or expired pre-registration token');
        }
        if (preRegistration.institutionId && preRegistration.institutionId !== data.institutionId) {
          throw new BadRequestException('Pre-registration token does not match this institution');
        }
      }

      const existing = await tx.application.findFirst({
        where: {
          institutionId: data.institutionId,
          status: { in: ['draft', 'submitted', 'under_review', 'resubmitted', 'final_review'] },
        },
      });
      if (existing) {
        throw new ConflictException(
          'An active application for this institution already exists',
        );
      }

      // Filter and sanitize valid trainingAreaIds to prevent UUID format errors
      let validTrainingAreaIds: string[] = [];
      if (data.trainingAreaIds && data.trainingAreaIds.length > 0) {
        const existingAreas = await tx.trainingArea.findMany({
          where: {
            OR: [
              { id: { in: data.trainingAreaIds.filter((id) => /^[0-9a-fA-F-]{36}$/.test(id)) } },
              { code: { in: data.trainingAreaIds } },
            ],
          },
          select: { id: true },
        });
        validTrainingAreaIds = existingAreas.map((a) => a.id);
      }

      const application = await tx.application.create({
        data: {
          institutionId: data.institutionId,
          applicantId: data.applicantId,
          status: 'draft',
          certificatesOffered: data.certificatesOffered,
          deliveryMethods: data.deliveryMethods,
          staffingCount: data.staffingCount,
          operationalInfo: data.operationalInfo,
          trainingAreas: validTrainingAreaIds.length
            ? { create: validTrainingAreaIds.map((trainingAreaId) => ({ trainingAreaId })) }
            : undefined,
          offeredCertificates: data.certificatesOffered.length
            ? { create: data.certificatesOffered.map((name) => ({ name })) }
            : undefined,
          deliveryMethodRecords: data.deliveryMethods.length
            ? { create: data.deliveryMethods.map((name) => ({ name })) }
            : undefined,
        },
      });

      if (data.preRegistrationToken) {
        await tx.preRegistration.update({
          where: { token: data.preRegistrationToken },
          data: { usedAt: new Date(), institutionId: data.institutionId },
        });
      }

      return tx.application.findUnique({
        where: { id: application.id },
        include: {
          institution: true,
          trainingAreas: { include: { trainingArea: true } },
          offeredCertificates: true,
          deliveryMethodRecords: true,
        },
      });
    });
  }

  async updateApplication(id: string, data: Partial<{
    certificatesOffered: string[];
    deliveryMethods: string[];
    staffingCount: number;
    operationalInfo: string;
  }>) {
    return this.prisma.application.update({
      where: { id },
      data: {
        ...(data.certificatesOffered && { certificatesOffered: data.certificatesOffered }),
        ...(data.deliveryMethods && { deliveryMethods: data.deliveryMethods }),
        ...(data.staffingCount && { staffingCount: data.staffingCount }),
        ...(data.operationalInfo && { operationalInfo: data.operationalInfo }),
      },
    });
  }

  async updateApplicationStatus(id: string, status: any) {
    return this.prisma.application.update({
      where: { id },
      data: { status, submittedAt: new Date() },
    });
  }

  async generateUploadToken(applicationId: string) {
    const token = randomBytes(32).toString('base64url');
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { paymentToken: token },
    });
    return token;
  }
}
