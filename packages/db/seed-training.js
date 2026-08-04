const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding training courses...');

  const courses = [
    {
      title: 'Commercial Driver Licence (CDL) Preparation',
      category: 'Licensing',
      description: 'A comprehensive preparation course covering all aspects of the Commercial Driver Licence examination, including pre-trip inspections, basic vehicle control, shifting gears, and backing manoeuvres.',
      duration: '40 hours',
      price: 499.99,
      isPublished: true,
    },
    {
      title: 'Defensive Driving for Commercial Vehicles',
      category: 'Safety',
      description: 'Learn advanced defensive driving techniques specifically designed for large commercial vehicles. Topics include hazard perception, space management, and weather condition driving.',
      duration: '16 hours',
      price: 249.99,
      isPublished: true,
    },
    {
      title: 'Hazardous Materials Transportation',
      category: 'Compliance',
      description: 'This FMCSA-compliant course covers safe handling, placarding, documentation, and emergency response procedures for hazardous materials transport.',
      duration: '24 hours',
      price: 349.99,
      isPublished: true,
    },
    {
      title: 'Driver Instructor Certification Program',
      category: 'Professional Development',
      description: 'Become a certified commercial driving instructor. This program covers adult learning theory, behind-the-wheel instruction techniques, and regulatory compliance for training institutions.',
      duration: '80 hours',
      price: 799.99,
      isPublished: true,
    },
    {
      title: 'Vehicle Pre-Trip Inspection Mastery',
      category: 'Safety',
      description: 'Master the FMCSA-required pre-trip inspection process. This hands-on course ensures every driver can confidently identify and document vehicle defects before departing.',
      duration: '8 hours',
      price: 129.99,
      isPublished: true,
    },
  ];

  for (const course of courses) {
    const exists = await prisma.training.findFirst({ where: { title: course.title } });
    if (!exists) {
      await prisma.training.create({ data: course });
      console.log('Created:', course.title);
    } else {
      console.log('Already exists:', course.title);
    }
  }

  console.log('Training seed complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
