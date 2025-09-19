require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('--- Starting Email Test Script ---');

  try {
    const transporterConfig = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true
    };

    console.log('1. Transporter Configuration Loaded:');
    console.log({ 
        host: transporterConfig.host, 
        port: transporterConfig.port, 
        secure: transporterConfig.secure, 
        user: transporterConfig.auth.user ? 'SET' : 'NOT SET',
        pass: transporterConfig.auth.pass ? 'SET' : 'NOT SET'
    });

    const transporter = nodemailer.createTransport(transporterConfig);
    console.log('\n2. Nodemailer transporter created successfully.');

    const mailOptions = {
      from: `"Test System" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM, // Sending to self for testing
      subject: 'Test Email from Venezuelan Raffle Website',
      html: '<h1>This is a test email.</h1><p>If you received this, the email configuration is working correctly.</p>',
    };

    console.log('\n3. Mail options prepared. Attempting to send email...');
    console.log('From:', mailOptions.from);
    console.log('To:', mailOptions.to);

    const info = await transporter.sendMail(mailOptions);

    console.log('\n--- SUCCESS ---');
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.log('\n--- FAILED ---');
    console.error('An error occurred during the email test:');
    console.error(error);
  }
}

testEmail();
