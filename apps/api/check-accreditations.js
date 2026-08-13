const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accs = await prisma.accreditation.findMany({
    include: { institution: true }
  });
  console.log('--- ACCREDITATIONS IN DB ---');
  accs.forEach(a => {
    console.log(`ID: ${a.id} | Code: ${a.accreditationCode} | Status: ${a.status} | Inst: ${a.institution?.name} (ID: ${a.institutionId}, isActive: ${a.institution?.isActive})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
