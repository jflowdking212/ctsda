import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function migrateDocuments() {
  console.log('Migrating documents to private_uploads...');
  
  const publicDir = path.join(process.cwd(), 'public', 'uploads');
  const privateDir = path.join(process.cwd(), 'private_uploads');
  
  if (!fs.existsSync(privateDir)) {
    fs.mkdirSync(privateDir, { recursive: true });
  }

  const documents = await prisma.applicationDocument.findMany();
  let moved = 0;

  for (const doc of documents) {
    const pubPath = path.join(publicDir, doc.storageKey);
    const privPath = path.join(privateDir, doc.storageKey);

    if (fs.existsSync(pubPath)) {
      fs.renameSync(pubPath, privPath);
      moved++;
      console.log(`Moved ${doc.storageKey} to private_uploads`);
    }
  }

  console.log(`Migration complete. Moved ${moved} documents.`);
  await prisma.$disconnect();
}

migrateDocuments().catch(console.error);
