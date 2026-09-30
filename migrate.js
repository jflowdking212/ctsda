const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const publicDir = path.join(process.cwd(), 'public', 'uploads');
const privateDir = path.join(process.cwd(), 'private_uploads');

if (!fs.existsSync(privateDir)) {
  fs.mkdirSync(privateDir, { recursive: true });
}

async function run() {
  const docs = await prisma.applicationDocument.findMany();
  let moved = 0;
  for (const doc of docs) {
    const pubPath = path.join(publicDir, doc.storageKey);
    const privPath = path.join(privateDir, doc.storageKey);
    if (fs.existsSync(pubPath)) {
      fs.renameSync(pubPath, privPath);
      moved++;
      console.log('Moved', doc.storageKey);
    }
  }
  console.log('Moved ' + moved + ' files');
  await prisma.$disconnect();
}
run().catch(console.error);
