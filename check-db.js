const { PrismaClient } = require('./packages/db/node_modules/@prisma/client');
const prisma = new PrismaClient();
prisma.training.findMany().then(res => {
  console.log(res.map(t => t.imageUrl));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
