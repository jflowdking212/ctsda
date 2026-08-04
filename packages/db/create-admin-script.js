const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ctsdamerica.com';
  const rawPassword = 'Preciouskey';
  
  console.log(`Setting up super_admin user: ${email}...`);

  const passwordHash = await argon2.hash(rawPassword);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'super_admin',
      isEmailVerified: true,
      isActive: true,
      firstName: 'Admin',
      lastName: 'CTSDA',
    },
    create: {
      email,
      firstName: 'Admin',
      lastName: 'CTSDA',
      role: 'super_admin',
      passwordHash,
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log(`✅ User ${user.email} (${user.role}) updated/created successfully!`);
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
