import fs from 'fs';
import path from 'path';
import { prisma } from './index';

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\889d076d-f0ca-434e-a0af-bc256eb5c64a';
const API_UPLOADS = path.join(__dirname, '..', '..', 'apps', 'api', 'public', 'uploads');
const WEB_UPLOADS = path.join(__dirname, '..', '..', 'apps', 'web', 'public', 'uploads');

if (!fs.existsSync(API_UPLOADS)) fs.mkdirSync(API_UPLOADS, { recursive: true });
if (!fs.existsSync(WEB_UPLOADS)) fs.mkdirSync(WEB_UPLOADS, { recursive: true });

const IMAGE_MAP = [
  { match: /road_safety/, filename: 'road-safety.jpg', category: 'Road Safety', title: 'Road Safety' },
  { match: /instructor_training/, filename: 'instructor-training.jpg', category: 'Instructor Training', title: 'Instructor' },
  { match: /compliance_training/, filename: 'compliance-training.jpg', category: 'Compliance', title: 'Compliance' },
  { match: /vehicle_inspection/, filename: 'vehicle-inspection.jpg', category: 'Vehicle Inspection', title: 'Vehicle' },
  { match: /first_aid/, filename: 'first-aid.jpg', category: 'First Aid', title: 'First Aid' },
  { match: /advanced_driving/, filename: 'advanced-driving.jpg', category: 'Advanced Driving', title: 'Advanced' },
];

async function main() {
  const artifactFiles = fs.readdirSync(ARTIFACT_DIR);
  console.log('Artifact files found:', artifactFiles.length);

  const copiedImages: Record<string, string> = {};

  for (const item of IMAGE_MAP) {
    const foundFile = artifactFiles.find(f => item.match.test(f) && f.endsWith('.jpg'));
    if (foundFile) {
      const srcPath = path.join(ARTIFACT_DIR, foundFile);
      const destApi = path.join(API_UPLOADS, item.filename);
      const destWeb = path.join(WEB_UPLOADS, item.filename);
      fs.copyFileSync(srcPath, destApi);
      fs.copyFileSync(srcPath, destWeb);
      console.log(`Copied ${foundFile} -> /uploads/${item.filename}`);
      copiedImages[item.category] = `/uploads/${item.filename}`;
    }
  }

  // Update training records in database
  const trainings = await prisma.training.findMany();
  console.log(`Found ${trainings.length} training modules in database.`);

  for (const t of trainings) {
    let assignedUrl: string | null = null;
    if (t.category && copiedImages[t.category]) {
      assignedUrl = copiedImages[t.category];
    } else {
      const matched = IMAGE_MAP.find(m => t.title.toLowerCase().includes(m.title.toLowerCase()) || (t.category && t.category.toLowerCase().includes(m.category.toLowerCase())));
      if (matched && copiedImages[matched.category]) {
        assignedUrl = copiedImages[matched.category];
      }
    }

    if (!assignedUrl) {
      assignedUrl = '/uploads/road-safety.jpg';
    }

    await prisma.training.update({
      where: { id: t.id },
      data: { imageUrl: assignedUrl }
    });
    console.log(`Linked Training "${t.title}" (${t.id}) -> ${assignedUrl}`);
  }

  console.log('Successfully linked generated images to Training modules!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
