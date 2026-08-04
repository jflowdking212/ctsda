import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'judeobidozie@gmail.com';
  console.log(`Looking for user ${email}...`);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    try {
      await prisma.auditLog.deleteMany({ where: { userId: user.id } });
    } catch (e) {}

    try {
      await prisma.emailDeliveryLog.deleteMany({ where: { userId: user.id } });
    } catch (e) {}

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
