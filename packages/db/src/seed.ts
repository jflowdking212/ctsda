import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const defaultRoles = [
  { code: 'super_admin', name: 'Super Admin' },
  { code: 'reviewer', name: 'Accreditation Reviewer' },
  { code: 'finance_officer', name: 'Finance Officer' },
  { code: 'support_officer', name: 'Support Officer' },
  { code: 'content_manager', name: 'Content Manager' },
  { code: 'auditor', name: 'Auditor' },
  { code: 'applicant', name: 'Institution Applicant' },
] as const;

async function main() {
  console.log('Seeding database...');

  const roles = await Promise.all(
    defaultRoles.map((role) =>
      prisma.role.upsert({
        where: { code: role.code },
        update: { name: role.name },
        create: role,
      }),
    ),
  );

  console.log(`Seeded ${roles.length} roles`);

  // Create training areas
  const trainingAreas = await Promise.all([
    prisma.trainingArea.upsert({
      where: { code: 'COMM-TRANS' },
      update: {},
      create: {
        name: 'Commercial Transport Operations',
        code: 'COMM-TRANS',
        description: 'Training for commercial transport vehicle operations and management',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'LOGISTICS' },
      update: {},
      create: {
        name: 'Logistics and Supply Chain Management',
        code: 'LOGISTICS',
        description: 'Training in logistics, warehousing, and supply chain operations',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'FLEET-MGMT' },
      update: {},
      create: {
        name: 'Fleet Management',
        code: 'FLEET-MGMT',
        description: 'Training in fleet maintenance, scheduling, and management',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'SAFETY-COMP' },
      update: {},
      create: {
        name: 'Transport Safety and Compliance',
        code: 'SAFETY-COMP',
        description: 'Training in transport safety regulations and compliance standards',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'DRIVER-TRAIN' },
      update: {},
      create: {
        name: 'Driver Training and Assessment',
        code: 'DRIVER-TRAIN',
        description: 'Training programs for commercial driver education and assessment',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'SOFTWARE-DEV' },
      update: {},
      create: {
        name: 'Software Engineering & Web Development',
        code: 'SOFTWARE-DEV',
        description: 'Programs in software development, coding bootcamps, and web engineering',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'ECOMMERCE-DIGITAL' },
      update: {},
      create: {
        name: 'E-Commerce & Digital Marketing',
        code: 'ECOMMERCE-DIGITAL',
        description: 'Training in online retail, digital marketing, and growth strategies',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'LEADERSHIP-MGMT' },
      update: {},
      create: {
        name: 'Corporate Leadership & Executive Management',
        code: 'LEADERSHIP-MGMT',
        description: 'Executive education, business leadership, and organizational development',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'FINTECH-FINANCE' },
      update: {},
      create: {
        name: 'Financial Management & FinTech',
        code: 'FINTECH-FINANCE',
        description: 'Accounting, corporate finance, financial analysis, and FinTech tools',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'CYBER-SECURITY' },
      update: {},
      create: {
        name: 'Cybersecurity & IT Infrastructure',
        code: 'CYBER-SECURITY',
        description: 'Information security, network administration, and cloud infrastructure',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'HSE-HEALTH' },
      update: {},
      create: {
        name: 'Health, Safety & Environment (HSE)',
        code: 'HSE-HEALTH',
        description: 'Occupational health, workplace safety, and environmental compliance',
      },
    }),
    prisma.trainingArea.upsert({
      where: { code: 'DATA-AI' },
      update: {},
      create: {
        name: 'Data Science & Artificial Intelligence',
        code: 'DATA-AI',
        description: 'Data analytics, machine learning, and AI application development',
      },
    }),
  ]);

  console.log(`Created ${trainingAreas.length} training areas`);

  // Create super admin if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ctsda.org';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD must be set before running the seed script');
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await argon2.hash(adminPassword),
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        isEmailVerified: true,
      },
    });
    console.log(`Created super admin: ${adminEmail}`);
  } else {
    console.log(`Super admin already exists: ${adminEmail}`);
  }

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail } });
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { code: 'super_admin' } });

  await prisma.userRoleAssignment.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: superAdminRole.id },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
