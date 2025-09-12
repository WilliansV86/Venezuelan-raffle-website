const nodemailer = require('nodemailer');

// --- ACTION REQUIRED --- 
// Please replace the placeholder values below with your actual SendGrid credentials.
const EMAIL_HOST = "smtp.sendgrid.net";
const EMAIL_PORT = 465; // Or 465, 2525 etc.
const EMAIL_USER = "apikey"; // For SendGrid, this is literally the string "apikey"
const EMAIL_PASS = "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"; // Replace with your actual API key
const EMAIL_FROM = "tusuerteestaaquive@gmail.com"; // Replace with the email you verified with SendGrid
// ---------------------

async function testEmailDirect() {
  console.log('--- Starting Direct Email Test ---');

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT == 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      debug: true
    });

    console.log('1. Transporter created.');

    const mailOptions = {
      from: `"Direct Test" <${EMAIL_FROM}>`,
      to: EMAIL_FROM, // Sending to self
      subject: 'Direct Email Test from Node.js',
      html: '<h1>This is a direct test.</h1><p>If you received this, nodemailer is working correctly.</p>',
    };

    console.log('2. Attempting to send email...');

    const info = await transporter.sendMail(mailOptions);

    console.log('\n--- SUCCESS ---');
    console.log('Email sent successfully!', info.response);

  } catch (error) {
    console.log('\n--- FAILED ---');
    console.error('An error occurred:', error);
  }
}

testEmailDirect();
