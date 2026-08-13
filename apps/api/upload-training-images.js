// Upload training images to production via the admin upload endpoint
// Then update each training record with the image URL

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API = 'https://ctsdamerica.com/api';
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

const IMAGES = [
  { filename: 'road-safety.jpg', label: 'road-safety' },
  { filename: 'instructor-training.jpg', label: 'instructor-training' },
  { filename: 'compliance-training.jpg', label: 'compliance-training' },
  { filename: 'vehicle-inspection.jpg', label: 'vehicle-inspection' },
  { filename: 'first-aid.jpg', label: 'first-aid' },
  { filename: 'advanced-driving.jpg', label: 'advanced-driving' },
];

// Training IDs and their categories from the live DB
const TRAININGS = [
  { id: '707e7488-7d47-4135-a029-e65c492c6eeb', category: 'Professional Development', imageFile: 'instructor-training.jpg' },
  { id: '5ff5f58a-02eb-4f58-8cca-ece624f32af2', category: 'Compliance', imageFile: 'compliance-training.jpg' },
  { id: '579cce9e-295e-4b55-bbaf-5684e39baddb', category: 'Safety', imageFile: 'advanced-driving.jpg' }, // Defensive Driving -> advanced driving image
];

async function uploadImage(filepath, token) {
  const filename = path.basename(filepath);
  const fileBuffer = fs.readFileSync(filepath);
  
  // Using FormData via native fetch with Blob
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', blob, filename);
  
  const res = await fetch(`${API}/admin/upload-image`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function updateTrainingImage(trainingId, imageUrl, token) {
  // First get the training
  const getRes = await fetch(`${API}/admin/training`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const trainings = await getRes.json();
  const training = trainings.find(t => t.id === trainingId);
  if (!training) throw new Error(`Training ${trainingId} not found`);
  
  const res = await fetch(`${API}/admin/training/${trainingId}/update`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...training, imageUrl }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function main() {
  // Prompt for admin credentials
  const args = process.argv.slice(2);
  const email = args[0];
  const password = args[1];
  
  if (!email || !password) {
    console.log('Usage: node upload-training-images.js <admin_email> <admin_password>');
    console.log('Example: node upload-training-images.js admin@ctsda.com mypassword');
    return;
  }
  
  console.log('Logging in...');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    return;
  }
  
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  if (!token) {
    console.error('No access token received:', JSON.stringify(loginData));
    return;
  }
  console.log('✓ Login successful');
  
  // Upload each image
  const uploadedUrls = {};
  for (const img of IMAGES) {
    const filepath = path.join(UPLOADS_DIR, img.filename);
    if (!fs.existsSync(filepath)) {
      console.log(`⚠ Skipping ${img.filename} - file not found locally`);
      continue;
    }
    try {
      console.log(`Uploading ${img.filename}...`);
      const result = await uploadImage(filepath, token);
      const imageUrl = result.url?.startsWith('http') ? result.url : `${API}${result.url}`;
      uploadedUrls[img.filename] = imageUrl;
      console.log(`✓ Uploaded ${img.filename} -> ${imageUrl}`);
    } catch (err) {
      console.error(`✗ Failed to upload ${img.filename}: ${err.message}`);
    }
  }
  
  // Update each training record
  for (const training of TRAININGS) {
    const imageUrl = uploadedUrls[training.imageFile];
    if (!imageUrl) {
      console.log(`⚠ Skipping training ${training.id} - no uploaded URL for ${training.imageFile}`);
      continue;
    }
    try {
      console.log(`Updating training ${training.id} (${training.category})...`);
      await updateTrainingImage(training.id, imageUrl, token);
      console.log(`✓ Updated training ${training.id} -> ${imageUrl}`);
    } catch (err) {
      console.error(`✗ Failed to update training ${training.id}: ${err.message}`);
    }
  }
  
  console.log('\nDone! All images uploaded and training records updated.');
}

main().catch(console.error);
