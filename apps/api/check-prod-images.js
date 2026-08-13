// Update training imageUrls in production DB via the Admin API
// We need an admin token first, then patch each training

const API = 'https://ctsdamerica.com/api';

const IMAGE_LINKS = {
  'Safety': `${API}/uploads/road-safety.jpg`,
  'Professional Development': `${API}/uploads/instructor-training.jpg`,
  'Compliance': `${API}/uploads/compliance-training.jpg`,
};

async function main() {
  // First, get a token via the admin login endpoint
  // The user needs to supply credentials - let's just verify the images exist
  const imagesToCheck = Object.values(IMAGE_LINKS);
  
  console.log('Checking if uploaded images are accessible on production...');
  for (const url of imagesToCheck) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`${url}: ${res.status} ${res.ok ? '✓ ACCESSIBLE' : '✗ NOT FOUND'}`);
    } catch (err) {
      console.log(`${url}: ✗ ERROR - ${err.message}`);
    }
  }

  // Also verify the manually added image still works
  const manualImg = 'https://ctsdamerica.com/api/uploads/1786609496351-jude.jpeg';
  try {
    const res = await fetch(manualImg, { method: 'HEAD' });
    console.log(`\nManual image: ${res.status} ${res.ok ? '✓ ACCESSIBLE' : '✗ NOT FOUND'}`);
  } catch (err) {
    console.log(`Manual image: ✗ ERROR`);
  }
}

main();
