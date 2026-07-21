const { PrismaClient } = require('./packages/db');
const prisma = new PrismaClient();
Promise.all([
  prisma.blogPost.findFirst(),
  prisma.training.findFirst()
]).then(r => console.log(JSON.stringify(r))).catch(console.error).finally(() => prisma.$disconnect());
