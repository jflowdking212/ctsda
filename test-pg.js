const { PrismaClient } = require('./packages/db');
const prisma = new PrismaClient();
prisma.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'SiteSetting'`)
  .then(r => console.log(r))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
