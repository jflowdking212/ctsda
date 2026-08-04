const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'blessingomoye212@gmail.com';
  console.log(`Checking OTPs and logs for: ${email}...`);

  const otps = await prisma.emailVerificationOTP.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log('OTPs:', JSON.stringify(otps, null, 2));

  const logs = await prisma.emailDeliveryLog.findMany({
    where: { recipient: email },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log('Delivery Logs:', JSON.stringify(logs, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
