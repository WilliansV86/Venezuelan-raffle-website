// Simple email test script with direct SendGrid credentials
const nodemailer = require('nodemailer');

// Configuration from .env file
const EMAIL_CONFIG = {
  host: "smtp.sendgrid.net",
  port: 587,
  user: "apikey",
  pass: "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",
  from: "Tu Suerte Está Aquí <tusuerteestaaquive@gmail.com>"
};

console.log('Starting email test with the following configuration:');
console.log(`Host: ${EMAIL_CONFIG.host}`);
console.log(`Port: ${EMAIL_CONFIG.port}`);
console.log(`User: ${EMAIL_CONFIG.user}`);
console.log(`From: ${EMAIL_CONFIG.from}`);
console.log('');

async function sendTestEmail() {
  try {
    console.log('Creating transport...');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass
      },
      debug: true, // Show debug output
      logger: true // Log information
    });
    
    console.log('Transport created successfully');

    // Define email content
    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: 'tusuerteestaaquive@gmail.com', // Sending to self for testing
      subject: 'Test Email from Venezuelan Raffle Website',
      html: `
        <h1>Email Test Successful</h1>
        <p>This is a test email from the Venezuelan Raffle Website.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <p>Current time: ${new Date().toISOString()}</p>
      `
    };
    
    console.log('Sending email to:', mailOptions.to);
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('ERROR SENDING EMAIL:');
    console.error(error);
    return false;
  }
}

// Run the test
sendTestEmail()
  .then(result => {
    console.log('\nTest completed with result:', result ? 'SUCCESS' : 'FAILURE');
    // Keep process alive for a moment to ensure all logs are printed
    setTimeout(() => process.exit(result ? 0 : 1), 1000);
  })
  .catch(err => {
    console.error('Unexpected error in test execution:', err);
    process.exit(1);
  });
