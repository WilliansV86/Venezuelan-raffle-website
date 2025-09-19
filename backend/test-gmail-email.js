// Gmail Email Test Script
require('dotenv').config();
const { sendGmailEmail } = require('./src/utils/gmailService');

// Default values (replace in .env file)
const DEFAULT_TEST_RECIPIENT = 'tusuerteestaaquive@gmail.com';

async function testGmailEmail() {
  console.log('=== Starting Gmail Email Test ===');

  // Check environment variables
  if (!process.env.GMAIL_USER) {
    console.error('ERROR: GMAIL_USER not found in .env file');
    console.error('Please add GMAIL_USER=your_gmail_address@gmail.com to your .env file');
    return;
  }

  if (!process.env.GMAIL_PASS) {
    console.error('ERROR: GMAIL_PASS not found in .env file');
    console.error('Please add GMAIL_PASS=your_app_password to your .env file');
    console.error('(See gmail-app-password-guide.md for instructions on creating an App Password)');
    return;
  }

  const recipient = process.env.TEST_EMAIL_RECIPIENT || DEFAULT_TEST_RECIPIENT;
  
  console.log(`Gmail User: ${process.env.GMAIL_USER}`);
  console.log(`Test recipient: ${recipient}`);
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h1 style="color: #4a90e2;">Gmail Test Email</h1>
      <p>This is a test email sent using Gmail from your Venezuelan Raffle Website application.</p>
      <p>If you received this email, your Gmail configuration is working correctly!</p>
      <p>Time: ${new Date().toISOString()}</p>
    </div>
  `;

  try {
    console.log('Sending test email...');
    
    await sendGmailEmail({
      to: recipient,
      subject: 'Gmail Test - Venezuelan Raffle Website',
      html: htmlContent
    });
    
    console.log('\n✅ SUCCESS: Test email sent successfully!');
    console.log('Check your inbox to verify the email was received.');
    
  } catch (error) {
    console.error('\n❌ ERROR: Failed to send test email');
    console.error('Error details:', error.message);
    
    if (error.message.includes('auth')) {
      console.error('\nAuthentication error. Please check:');
      console.error('1. GMAIL_USER is correct');
      console.error('2. GMAIL_PASS is a valid App Password (not your regular Gmail password)');
      console.error('3. You have enabled 2-Step Verification on your Google account');
    }
  }
}

// Run the test
testGmailEmail();
