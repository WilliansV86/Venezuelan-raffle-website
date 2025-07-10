require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Starting email test...');
  console.log('Email configuration:');
  console.log(`- Host: ${process.env.EMAIL_HOST}`);
  console.log(`- Port: ${process.env.EMAIL_PORT}`);
  console.log(`- User: ${process.env.EMAIL_USER}`);
  console.log(`- From: ${process.env.EMAIL_FROM}`);
  console.log(`- Admin: ${process.env.ADMIN_EMAIL}`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true // Enable debug output
  });

  try {
    // Verify connection configuration
    console.log('Verifying connection configuration...');
    await transporter.verify();
    console.log('Server is ready to take our messages');

    // Try sending a test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Test Sender'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'Test Email - Venezuelan Raffle Website',
      text: 'This is a test email to verify the email sending functionality is working.',
      html: '<b>This is a test email to verify the email sending functionality is working.</b>'
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log('SUCCESS: Email was sent successfully!');
  } catch (error) {
    console.error('ERROR: Failed to send email:');
    console.error(error);
    if (error.code === 'EAUTH') {
      console.log('\nAuthentication failed. Check your EMAIL_USER and EMAIL_PASSWORD in .env');
      console.log('If using Gmail, make sure you\'re using an App Password, not your regular password.');
    } else if (error.code === 'ESOCKET') {
      console.log('\nConnection failed. Your network might be blocking the SMTP port.');
    }
  }
}

testEmail();
