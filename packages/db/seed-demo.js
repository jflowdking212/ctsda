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
