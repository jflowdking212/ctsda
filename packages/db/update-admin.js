const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ctsda.org';
  const newPassword = 'PreciousKey';
  
  const passwordHash = await argon2.hash(newPassword);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
    console.log(`Updated password for ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        isEmailVerified: true,
      },
    });
    console.log(`Created admin user ${email}`);
    
    // Also make sure user role assignment exists
    const admin = await prisma.user.findUnique({ where: { email } });
    const superAdminRole = await prisma.role.findUnique({ where: { code: 'super_admin' } });
    
    if (admin && superAdminRole) {
      await prisma.userRoleAssignment.upsert({
        where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
        update: {},
        create: { userId: admin.id, roleId: superAdminRole.id },
      });
      console.log('Role assigned.');
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
