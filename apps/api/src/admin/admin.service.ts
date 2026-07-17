import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { PrismaService } from '../common/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';
import { AccreditationsService } from '../accreditations/accreditations.service';

const ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'reviewer',
  'finance_officer',
  'support_officer',
  'content_manager',
  'auditor',
];

const APPLICATION_MANAGERS: UserRole[] = ['super_admin', 'reviewer', 'support_officer'];
const INSTITUTION_MANAGERS: UserRole[] = ['super_admin', 'support_officer', 'content_manager'];
const USER_MANAGERS: UserRole[] = ['super_admin'];
const EXPORT_ROLES: UserRole[] = ['super_admin', 'support_officer', 'auditor'];

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private reviewsService: ReviewsService,
    private accreditationsService: AccreditationsService,
  ) {}

  async getAdminProfile(userId: string) {
    const user = await this.requireRole(userId, ADMIN_ROLES);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isTotpEnabled: user.isTotpEnabled,
    };
  }

  async listApplications(actorId: string, filters: { status?: ApplicationStatus; reviewerId?: string; from?: string; to?: string }) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);

    return this.prisma.application.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.reviewerId && { reviewedBy: filters.reviewerId }),
        ...((filters.from || filters.to) && {
          createdAt: {
            ...(filters.from && { gte: new Date(filters.from) }),
            ...(filters.to && { lte: new Date(filters.to) }),
          },
        }),
      },
      include: {
        institution: { select: { id: true, name: true, country: true, logoUrl: true } },
        applicant: { select: { id: true, email: true, firstName: true, lastName: true } },
        reviewer: { select: { id: true, email: true, firstName: true, lastName: true } },
        checklistItems: true,
        comments: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async getApplication(actorId: string, id: string) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        institution: true,
        applicant: { select: { id: true, email: true, firstName: true, lastName: true } },
        reviewer: { select: { id: true, email: true, firstName: true, lastName: true } },
        documents: true,
        checklistItems: { orderBy: { createdAt: 'asc' } },
        comments: {
          include: { author: { select: { id: true, email: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        invoices: true,
        accreditations: { include: { certificates: true } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async transitionApplication(actorId: string, id: string, status: ApplicationStatus, metadata?: Record<string, any>) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.reviewsService.transitionStatus(id, status, actorId, metadata);
  }

  async assignReviewer(actorId: string, id: string, reviewerId: string) {
    await this.requireRole(actorId, ['super_admin', 'support_officer']);
    return this.reviewsService.assignReviewer(id, reviewerId, actorId);
  }

  async addComment(actorId: string, id: string, content: string, isInternal = true) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.reviewsService.addComment(id, actorId, content, isInternal);
  }

  async createChecklistItem(actorId: string, id: string, label: string) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.reviewsService.createChecklistItem(id, actorId, label);
  }

  async setChecklistItem(actorId: string, itemId: string, isCompleted: boolean) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.reviewsService.setChecklistItemCompleted(itemId, actorId, isCompleted);
  }

  async updateReviewerNotes(actorId: string, id: string, notes: string) {
    await this.requireRole(actorId, APPLICATION_MANAGERS);
    return this.prisma.application.update({
      where: { id },
      data: { reviewerNotes: notes },
    });
  }

  async listInstitutions(actorId: string) {
    await this.requireRole(actorId, INSTITUTION_MANAGERS);
    return this.prisma.institution.findMany({
      include: { accreditations: true },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }

  async updateInstitution(actorId: string, id: string, data: { name?: string; website?: string; logoUrl?: string; description?: string; isActive?: boolean }) {
    await this.requireRole(actorId, INSTITUTION_MANAGERS);
    return this.prisma.institution.update({
      where: { id },
      data,
    });
  }

  async exportInstitutionsCsv(actorId: string) {
    const actor = await this.requireRole(actorId, EXPORT_ROLES);
    const institutions = await this.prisma.institution.findMany({
      include: { accreditations: true },
      orderBy: { name: 'asc' },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actor.id,
        action: 'export_performed',
        entityType: 'institution',
        metadata: { format: 'csv', rows: institutions.length },
      },
    });

    const rows = institutions.map((institution) => [
      institution.name,
      institution.registrationNumber,
      institution.country,
      institution.email,
      institution.website || '',
      institution.accreditations.map((accreditation) => accreditation.accreditationCode).join('; '),
      institution.isActive ? 'active' : 'inactive',
    ]);

    return this.toCsv([
      ['Name', 'Registration Number', 'Country', 'Email', 'Website', 'Accreditation Codes', 'Status'],
      ...rows,
    ]);
  }

  async suspendAccreditation(actorId: string, id: string, reason?: string) {
    await this.requireRole(actorId, ['super_admin', 'support_officer']);
    return this.accreditationsService.suspend(id, actorId, reason);
  }

  async reactivateAccreditation(actorId: string, id: string, reason?: string) {
    await this.requireRole(actorId, ['super_admin', 'support_officer']);
    return this.accreditationsService.reactivate(id, actorId, reason);
  }

  async listUsers(actorId: string) {
    await this.requireRole(actorId, USER_MANAGERS);
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isTotpEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async updateUser(actorId: string, id: string, data: { role?: UserRole; isActive?: boolean }) {
    await this.requireRole(actorId, USER_MANAGERS);
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  async changePassword(actorId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: actorId } });
    if (!user || !(await argon2.verify(user.passwordHash, currentPassword))) {
      throw new BadRequestException('Current password is incorrect');
    }

    await this.prisma.user.update({
      where: { id: actorId },
      data: { passwordHash: await argon2.hash(newPassword) },
    });

    return { success: true };
  }

  async listAuditLogs(actorId: string) {
    await this.requireRole(actorId, ['auditor', 'super_admin']);
    return this.prisma.auditLog.findMany({
      include: { user: { select: { email: true, firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  private async requireRole(userId: string, allowedRoles: UserRole[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new ForbiddenException('User is not active');
    }
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return user;
  }

  private toCsv(rows: Array<Array<string | number | boolean>>) {
    return rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? '');
            return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(','),
      )
      .join('\n');
  }
}
