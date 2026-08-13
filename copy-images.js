const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/HP/.gemini/antigravity/brain/889d076d-f0ca-434e-a0af-bc256eb5c64a';
const API_UPLOADS = path.join(__dirname, 'apps', 'api', 'public', 'uploads');
const WEB_UPLOADS = path.join(__dirname, 'apps', 'web', 'public', 'uploads');

if (!fs.existsSync(API_UPLOADS)) fs.mkdirSync(API_UPLOADS, { recursive: true });
if (!fs.existsSync(WEB_UPLOADS)) fs.mkdirSync(WEB_UPLOADS, { recursive: true });

const IMAGE_MAP = [
  { match: /road_safety/, filename: 'road-safety.jpg' },
  { match: /instructor_training/, filename: 'instructor-training.jpg' },
  { match: /compliance_training/, filename: 'compliance-training.jpg' },
  { match: /vehicle_inspection/, filename: 'vehicle-inspection.jpg' },
  { match: /first_aid/, filename: 'first-aid.jpg' },
  { match: /advanced_driving/, filename: 'advanced-driving.jpg' },
];

const artifactFiles = fs.readdirSync(ARTIFACT_DIR);
console.log('Found artifact files:', artifactFiles.length);

for (const item of IMAGE_MAP) {
  const foundFile = artifactFiles.find(f => item.match.test(f) && f.endsWith('.jpg'));
  if (foundFile) {
    const srcPath = path.join(ARTIFACT_DIR, foundFile);
    fs.copyFileSync(srcPath, path.join(API_UPLOADS, item.filename));
    fs.copyFileSync(srcPath, path.join(WEB_UPLOADS, item.filename));
    console.log(`Successfully copied ${foundFile} to /uploads/${item.filename}`);
  }
}
