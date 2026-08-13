const fs = require('fs');
const path = require('path');

const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '..', '.env'),
  path.join(__dirname, '..', '..', '.env.local'),
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    console.log('Found env file at:', p);
    const content = fs.readFileSync(p, 'utf8');
    const dbLine = content.split('\n').find(l => l.startsWith('DATABASE_URL'));
    if (dbLine) console.log('  ', dbLine.substring(0, 30) + '...');
  }
}
