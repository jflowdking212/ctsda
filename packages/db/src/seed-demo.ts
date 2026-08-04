// dotenv removed because env is passed directly
import { PrismaClient, ApplicationStatus } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  const passwordHash = await argon2.hash('Password123!');

  // Create reviewer user
  let reviewer = await prisma.user.findUnique({ where: { email: 'reviewer@ctsda.org' } });
  if (!reviewer) {
    reviewer = await prisma.user.create({
      data: {
        email: 'reviewer@ctsda.org',
        passwordHash,
        firstName: 'Jane',
        lastName: 'Reviewer',
        role: 'reviewer',
        isEmailVerified: true,
      },
    });
    const role = await prisma.role.findUnique({ where: { code: 'reviewer' } });
    if (role) {
      await prisma.userRoleAssignment.create({
        data: { userId: reviewer.id, roleId: role.id },
      });
    }
    console.log('Created reviewer@ctsda.org');
  }

  // Create applicant user
  let applicant = await prisma.user.findUnique({ where: { email: 'applicant@demo.org' } });
  if (!applicant) {
    applicant = await prisma.user.create({
      data: {
        email: 'applicant@demo.org',
        passwordHash,
        firstName: 'John',
        lastName: 'Applicant',
        role: 'applicant',
        isEmailVerified: true,
      },
    });
    console.log('Created applicant@demo.org');
  }

  // Create institution 1 (Approved)
  const inst1 = await prisma.institution.upsert({
    where: { registrationNumber: 'REG-1001' },
    update: {},
    create: {
      name: 'Global Transport Academy',
      slug: 'global-transport-academy',
      registrationNumber: 'REG-1001',
      institutionType: 'Vocational Training Center',
      country: 'united states',
      address: '123 Training Ave, NY 10001',
      phone: '+1 555-1234',
      email: 'contact@gta.edu',
      createdBy: applicant.id,
    }
  });

  // Create application 1 (Approved)
  let app1 = await prisma.application.findFirst({ where: { institutionId: inst1.id } });
  if (!app1) {
    app1 = await prisma.application.create({
      data: {
        institutionId: inst1.id,
        applicantId: applicant.id,
        status: 'approved',
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reviewedBy: reviewer.id,
        reviewerNotes: 'All standards met securely.',
      }
    });

    // Issue accreditation
    await prisma.accreditation.create({
      data: {
        applicationId: app1.id,
        institutionId: inst1.id,
        status: 'active',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        accreditationCode: 'ACC-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      }
    });
    console.log('Created Approved application & accreditation for Global Transport Academy');
  }

  // Create institution 2 (Submitted/Pending Review)
  const inst2 = await prisma.institution.upsert({
    where: { registrationNumber: 'REG-2002' },
    update: {},
    create: {
      name: 'Pioneer Logistics Institute',
      slug: 'pioneer-logistics-institute',
      registrationNumber: 'REG-2002',
      institutionType: 'University',
      country: 'united kingdom',
      address: '45 Pioneer St, London',
      phone: '+44 20 7123',
      email: 'info@pioneer.ac.uk',
      createdBy: applicant.id,
    }
  });

  // Create application 2 (Submitted)
  let app2 = await prisma.application.findFirst({ where: { institutionId: inst2.id } });
  if (!app2) {
    await prisma.application.create({
      data: {
        institutionId: inst2.id,
        applicantId: applicant.id,
        status: 'submitted',
        submittedAt: new Date(),
      }
    });
    console.log('Created Submitted application for Pioneer Logistics Institute');
  }
  
  // Create institution 3 (Under Review)
  const inst3 = await prisma.institution.upsert({
    where: { registrationNumber: 'REG-3003' },
    update: {},
    create: {
      name: 'SafeDrive Safety Center',
      slug: 'safedrive-safety-center',
      registrationNumber: 'REG-3003',
      institutionType: 'Corporate Training',
      country: 'australia',
      address: '88 Safety Blvd, Sydney',
      phone: '+61 2 1234',
      email: 'hello@safedrive.com.au',
      createdBy: applicant.id,
    }
  });

  let app3 = await prisma.application.findFirst({ where: { institutionId: inst3.id } });
  if (!app3) {
    await prisma.application.create({
      data: {
        institutionId: inst3.id,
        applicantId: applicant.id,
        status: 'under_review',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reviewedBy: reviewer.id,
      }
    });
    console.log('Created Under Review application for SafeDrive Safety Center');
  }

  console.log('Demo data seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
