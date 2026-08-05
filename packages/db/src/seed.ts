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

  const trainingAreas = await Promise.all(
    officialAreas.map((area) =>
      prisma.trainingArea.upsert({
        where: { code: area.code },
        update: { name: area.name, description: area.description, isActive: true },
        create: { name: area.name, code: area.code, description: area.description, isActive: true },
      })
    )
  );

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
