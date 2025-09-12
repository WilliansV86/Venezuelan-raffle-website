const nodemailer = require('nodemailer');

// Configuration with alternate port and TLS settings
const EMAIL_HOST = "smtp.sendgrid.net";
const EMAIL_PORT = 587; // Try port 587 instead of 465
const EMAIL_USER = "apikey";
const EMAIL_PASS = "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";
const EMAIL_FROM = "tusuerteestaaquive@gmail.com";

async function testEmailAlternate() {
  console.log('--- Starting Alternate Port Email Test ---');
  console.log(`Using port ${EMAIL_PORT} with secure: false`);

  try {
    // Create transporter with different configuration
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: false, // False for port 587
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      // TLS configuration
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      },
      debug: true
    });

    console.log('1. Alternate transporter created.');

    const mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_FROM, // Sending to self
      subject: 'Alternate Port Email Test',
      html: '<h1>This is a test with alternate port.</h1><p>If you received this, the alternate configuration is working.</p>',
    };

    console.log('2. Attempting to send email...');

    const info = await transporter.sendMail(mailOptions);

    console.log('\n--- SUCCESS ---');
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

  } catch (error) {
    console.log('\n--- FAILED ---');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ESOCKET') {
      console.log('\nSocket connection error. This could be due to:');
      console.log('1. Network restrictions blocking outgoing SMTP connections');
      console.log('2. Firewall blocking port ' + EMAIL_PORT);
      console.log('3. Antivirus or security software blocking the connection');
    }
  }
}

testEmailAlternate();
