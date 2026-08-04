const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up stale/empty siteSettings...');

  const settingsToDelete = ['smtpPassword', 'smtpUser', 'smtpHost', 'smtpPort', 'smtpFrom', 'smtpSecure'];

  for (const key of settingsToDelete) {
    const existing = await prisma.siteSetting.findUnique({ where: { key } });
    if (existing && (!existing.value || existing.value.trim() === '')) {
      await prisma.siteSetting.delete({ where: { key } });
      console.log(`Deleted empty siteSetting key: ${key}`);
    }
  }

  // Set default working SMTP settings in database
  await prisma.siteSetting.upsert({
    where: { key: 'smtpHost' },
    update: { value: 'mail.acecoterieconsulting.com' },
    create: { key: 'smtpHost', value: 'mail.acecoterieconsulting.com' },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'smtpPort' },
    update: { value: '587' },
    create: { key: 'smtpPort', value: '587' },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'smtpUser' },
    update: { value: 'accounts@acecoterieconsulting.com' },
    create: { key: 'smtpUser', value: 'accounts@acecoterieconsulting.com' },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'smtpPassword' },
    update: { value: 'Preciouskey2030' },
    create: { key: 'smtpPassword', value: 'Preciouskey2030' },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'smtpFrom' },
    update: { value: 'accounts@acecoterieconsulting.com' },
    create: { key: 'smtpFrom', value: 'accounts@acecoterieconsulting.com' },
  });

  console.log('✅ Site settings cleaned and reset to valid SMTP configuration!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
