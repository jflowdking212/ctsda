const { PrismaClient } = require('/home/acecoter/public_html/ctsda.acecoterieconsulting.com/apps/api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all accredited institutions, applications, certificates, invoices...');
  
  await prisma.accreditation.deleteMany({}).catch(e => console.log('Accreditations:', e.message));
  await prisma.studentCertificate.deleteMany({}).catch(e => console.log('StudentCertificates:', e.message));
  await prisma.invoice.deleteMany({}).catch(e => console.log('Invoices:', e.message));
  await prisma.payment.deleteMany({}).catch(e => console.log('Payments:', e.message));
  await prisma.applicationDocument.deleteMany({}).catch(e => console.log('AppDocs:', e.message));
  await prisma.applicationComment.deleteMany({}).catch(e => console.log('AppComments:', e.message));
  await prisma.applicationReview.deleteMany({}).catch(e => console.log('AppReviews:', e.message));
  await prisma.applicationChecklistItem.deleteMany({}).catch(e => console.log('AppChecklist:', e.message));
  await prisma.applicationStatusHistory.deleteMany({}).catch(e => console.log('AppHistory:', e.message));
  await prisma.application.deleteMany({}).catch(e => console.log('Applications:', e.message));
  await prisma.institutionContact.deleteMany({}).catch(e => console.log('Contacts:', e.message));
  await prisma.institutionSocialLink.deleteMany({}).catch(e => console.log('Social:', e.message));
  await prisma.institutionTrainingArea.deleteMany({}).catch(e => console.log('Areas:', e.message));
  await prisma.preRegistration.deleteMany({}).catch(e => console.log('PreReg:', e.message));
  await prisma.subscription.deleteMany({}).catch(e => console.log('Subs:', e.message));
  await prisma.order.deleteMany({}).catch(e => console.log('Orders:', e.message));
  await prisma.institution.deleteMany({}).catch(e => console.log('Institutions:', e.message));

  console.log('--- ALL ACCREDITED INSTITUTIONS & RECORDS CLEARED ---');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
