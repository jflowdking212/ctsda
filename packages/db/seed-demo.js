const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const argon2 = require('argon2');

async function main() {
  console.log('Seeding demo data...');

  // 1. Create a super_admin user if one doesn't exist
  const adminEmail = 'admin@ctsda.gov';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!admin) {
    const passwordHash = await argon2.hash('admin123');
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        passwordHash,
        isEmailVerified: true,
        isActive: true,
      },
    });
    console.log('Created Super Admin: admin@ctsda.gov / admin123');
  }

  // 2. Create some demo settings
  const defaultSettings = {
    siteTitle: 'CTSDA',
    siteTagline: 'Empowering Safe Driving',
    metaDescription: 'CTSDA is the premier authority for driving school accreditation and standards.',
    logoUrl: '/images/logo-ctsda.png',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log('Created demo settings.');

  // 3. Create some demo blog posts
  const postCount = await prisma.blogPost.count();
  if (postCount === 0) {
    await prisma.blogPost.createMany({
      data: [
        {
          title: 'New Accreditation Standards for 2027',
          slug: 'new-accreditation-standards-2027',
          excerpt: 'We are introducing new rigorous standards for all driving schools starting next year.',
          content: '<p>These new standards focus on advanced simulator training and hazard perception testing. Schools will have a 6-month grace period to upgrade their facilities.</p>',
          isPublished: true,
          publishedAt: new Date(),
          authorId: admin.id,
        },
        {
          title: 'How to Prepare for Your Audit',
          slug: 'how-to-prepare-for-your-audit',
          excerpt: 'A comprehensive guide to passing the annual CTSDA audit with flying colors.',
          content: '<p>Ensure all your instructor certifications are up to date and your vehicle maintenance logs are readily available. The audit will cover 5 key operational areas.</p>',
          isPublished: true,
          publishedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          authorId: admin.id,
        }
      ]
    });
    console.log('Created demo blog posts.');
  }

  // 4. Seed demo certificate for verification testing
  let inst = await prisma.institution.findFirst({
    where: { name: 'The Bliss Tech Academy' }
  });
  if (!inst) {
    inst = await prisma.institution.create({
      data: {
        name: 'The Bliss Tech Academy',
        slug: 'the-bliss-tech-academy',
        institutionType: 'Academy',
        registrationNumber: 'RC-889104',
        country: 'Nigeria',
        address: '12 Commercial Avenue, Yaba, Lagos',
        phone: '+2348012345678',
        email: 'info@theblisstech.com'
      }
    });
  }

  let app = await prisma.application.findFirst({
    where: { institutionId: inst.id }
  });
  if (!app) {
    app = await prisma.application.create({
      data: {
        institutionId: inst.id,
        applicantFirstName: 'The Bliss',
        applicantLastName: 'Tech',
        applicantEmail: 'info@theblisstech.com',
        status: 'approved'
      }
    });
  }

  let accreditation = await prisma.accreditation.findFirst({
    where: { applicationId: app.id }
  });
  if (!accreditation) {
    accreditation = await prisma.accreditation.create({
      data: {
        institutionId: inst.id,
        applicationId: app.id,
        accreditationCode: 'CTSDA-ACCR-2026-001',
        status: 'active',
        issuedAt: new Date('2026-08-04'),
        expiresAt: new Date('2027-08-04')
      }
    });
  }

  const certNumber = 'CTSDA-2026-889104';
  let cert = await prisma.certificate.findUnique({
    where: { certificateNumber: certNumber }
  });
  if (!cert) {
    cert = await prisma.certificate.create({
      data: {
        accreditationId: accreditation.id,
        certificateNumber: certNumber,
        verificationToken: 'v-tok-889104',
        status: 'active',
        issueDate: new Date('2026-08-04'),
        expiryDate: new Date('2027-08-04')
      }
    });
    console.log('Created Mock Certificate: CTSDA-2026-889104');
  }

  let cert2 = await prisma.certificate.findUnique({
    where: { certificateNumber: 'CERT-0042' }
  });
  if (!cert2) {
    cert2 = await prisma.certificate.create({
      data: {
        accreditationId: accreditation.id,
        certificateNumber: 'CERT-0042',
        verificationToken: 'abc123xy',
        status: 'active',
        issueDate: new Date('2026-08-04'),
        expiryDate: new Date('2027-08-04')
      }
    });
    console.log('Created Mock Certificate: CERT-0042 / abc123xy');
  }

  console.log('Demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
