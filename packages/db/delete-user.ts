import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'judeobidozie@gmail.com';
  console.log(`Looking for user ${email}...`);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    // Delete any related audit logs first
    try {
      await prisma.auditLog.deleteMany({
        where: { userId: user.id },
      });
      console.log('Deleted related audit logs.');
    } catch (e) {
      console.log('Could not delete audit logs, they might not exist or be named differently', e);
    }

    await prisma.user.delete({
      where: { email },
    });
    console.log(`Deleted user ${email} successfully.`);
  } else {
    console.log(`User ${email} not found.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
