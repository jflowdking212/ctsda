const { PrismaClient } = require('./packages/db');
const prisma = new PrismaClient();
async function test() {
  const settings = { accreditationFee: 500, applicationFee: 50 };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log('done');
}
test().catch(console.error).finally(() => prisma.$disconnect());
