// Update training records in production DB via admin API
// Links the 3 trainings that still have null imageUrl to their category-matched images

const API = 'https://ctsda.acecoterieconsulting.com/api';

// Training IDs from the live DB (from previous inspection)
const UPDATES = [
  {
    id: '707e7488-7d47-4135-a029-e65c492c6eeb',
    title: 'Driver Instructor Certification Program',
    category: 'Professional Development',
    imageUrl: `${API}/uploads/instructor-training.jpg`,
    description: 'Become a certified commercial driving instructor. This program covers adult learning theory, behind-the-wheel instruction techniques, and regulatory compliance for training institutions.',
    price: 799.99,
    duration: '80 hours',
    isPublished: true,
  },
  {
    id: '5ff5f58a-02eb-4f58-8cca-ece624f32af2',
    title: 'Hazardous Materials Transportation',
    category: 'Compliance',
    imageUrl: `${API}/uploads/compliance-training.jpg`,
    description: 'This FMCSA-compliant course covers safe handling, placarding, documentation, and emergency response procedures for hazardous materials transport.',
    price: 349.99,
    duration: '24 hours',
    isPublished: true,
  },
  {
    id: '579cce9e-295e-4b55-bbaf-5684e39baddb',
    title: 'Defensive Driving for Commercial Vehicles',
    category: 'Safety',
    imageUrl: `${API}/uploads/advanced-driving.jpg`,
    description: 'Learn advanced defensive driving techniques specifically designed for large commercial vehicles. Topics include hazard perception, space management, and weather condition driving.',
    price: 249.99,
    duration: '16 hours',
    isPublished: true,
  },
];

async function main() {
  const adminEmail = process.argv[2];
  const adminPassword = process.argv[3];

  if (!adminEmail || !adminPassword) {
    console.log('Usage: node update-training-images.js <email> <password>');
    return;
  }

  // Login
  console.log('Logging in...');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.error('Login failed:', text);
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.accessToken || loginData.token;
  if (!token) {
    console.error('No token in response:', JSON.stringify(loginData));
    return;
  }
  console.log('✓ Logged in');

  // Update each training
  for (const training of UPDATES) {
    console.log(`\nUpdating: ${training.title}...`);
    
    const payload = {
      title: training.title,
      description: training.description,
      category: training.category,
      imageUrl: training.imageUrl,
      duration: training.duration,
      price: training.price,
      isPublished: training.isPublished,
    };

    const res = await fetch(`${API}/admin/training/${training.id}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`✗ Failed (${res.status}):`, text);
    } else {
      const data = await res.json();
      console.log(`✓ Updated! imageUrl = ${data.imageUrl}`);
    }
  }

  // Verify by fetching all trainings
  console.log('\n--- Verifying all trainings ---');
  const verifyRes = await fetch(`${API}/training`, { cache: 'no-store' });
  const trainings = await verifyRes.json();
  trainings.forEach((t) => {
    console.log(`${t.imageUrl ? '✓' : '✗'} ${t.title}: ${t.imageUrl || 'NO IMAGE'}`);
  });
}

main().catch(console.error);
