// Direct email test script with detailed logging
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('='.repeat(50));
console.log('EMAIL CONFIGURATION DIAGNOSTIC');
console.log('='.repeat(50));

// Check for required environment variables
const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

console.log('\nChecking environment variables:');
if (missingVars.length > 0) {
  console.error('MISSING VARIABLES:', missingVars.join(', '));
  console.log('\nAvailable environment variables:');
  for (const key in process.env) {
    if (key.startsWith('EMAIL_')) {
      const value = key === 'EMAIL_PASS' ? '********' : process.env[key];
      console.log(`${key}: ${value}`);
    }
  }
} else {
  console.log('All required email variables are present');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', '[HIDDEN]');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
}

async function testEmailSending() {
  console.log('\n' + '='.repeat(50));
  console.log('ATTEMPTING TO SEND TEST EMAIL');
  console.log('='.repeat(50));
  
  try {
    // Create transport configuration with verbose logging
    const transportConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: (parseInt(process.env.EMAIL_PORT) || 587) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true,
      logger: true
    };
    
    console.log('\nCreating transporter with configuration:');
    console.log(JSON.stringify({
      host: transportConfig.host,
      port: transportConfig.port,
      secure: transportConfig.secure,
      auth: { user: transportConfig.auth.user }
    }, null, 2));
    
    // Create transporter
    const transporter = nodemailer.createTransport(transportConfig);
    
    console.log('\nVerifying SMTP connection...');
    try {
      await transporter.verify();
      console.log('✓ SMTP connection successful!');
    } catch (verifyError) {
      console.error('✗ SMTP verification failed:', verifyError.message);
      console.error('Error code:', verifyError.code);
      if (verifyError.response) console.error('Server response:', verifyError.response);
      throw verifyError;
    }
    
    // Define email content for test
    const recipientEmail = process.env.EMAIL_FROM; // Send to self for testing
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: 'Raffle System - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
          <h2>Test Email from Venezuelan Raffle System</h2>
          <p>If you're seeing this email, the email sending functionality is working correctly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    };
    
    console.log(`\nSending test email to: ${recipientEmail}`);
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✓ TEST EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    if (info.response) console.log('SMTP Response:', info.response);
    
    return true;
  } catch (error) {
    console.error('\n✗ EMAIL SENDING FAILED');
    console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.response) console.error('Server response:', error.response);
    
    // Provide suggestions based on error
    console.log('\nPossible solutions:');
    if (error.code === 'EAUTH') {
      console.log('- Verify that EMAIL_USER and EMAIL_PASS are correct');
      console.log('- If using SendGrid, EMAIL_USER should be "apikey" and EMAIL_PASS should be your SendGrid API key');
      console.log('- Check if your SendGrid API key has permission to send emails');
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      console.log('- Verify that EMAIL_HOST and EMAIL_PORT are correct');
      console.log('- Check if there are any network restrictions blocking SMTP traffic');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('- The connection to the SMTP server timed out');
      console.log('- Check your network connectivity or firewall settings');
    }
    
    return false;
  }
}

// Run the test
testEmailSending()
  .then(result => {
    console.log('\n' + '='.repeat(50));
    console.log(`TEST RESULT: ${result ? 'SUCCESS' : 'FAILURE'}`);
    console.log('='.repeat(50));
    
    // Exit with appropriate code
    process.exit(result ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error in test execution:', err);
    process.exit(1);
  });
