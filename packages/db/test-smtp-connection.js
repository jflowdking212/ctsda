const nodemailer = require('nodemailer');

async function main() {
  console.log('Testing SMTP connection to mail.acecoterieconsulting.com:587...');

  const transporter = nodemailer.createTransport({
    host: 'mail.acecoterieconsulting.com',
    port: 587,
    secure: false,
    auth: {
      user: 'accounts@acecoterieconsulting.com',
      pass: 'Preciouskey2030',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP CONNECTION SUCCESSFUL!');
  } catch (err) {
    console.error('❌ SMTP VERIFY ERROR:', err.message);
  }
}

main();
