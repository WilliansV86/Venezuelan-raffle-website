// Brevo Email Test Script
require('dotenv').config();
const { sendBrevoEmail } = require('./src/utils/brevoService');

// Default test recipient - change in .env if needed
const DEFAULT_TEST_RECIPIENT = 'tusuerteestaaquive@gmail.com';

async function testBrevoEmail() {
  console.log('=== Starting Brevo Email Test ===');

  // Check environment variables
  if (!process.env.BREVO_API_KEY) {
    console.error('ERROR: BREVO_API_KEY not found in .env file');
    console.error('Please add BREVO_API_KEY=your-api-key to your .env file');
    return;
  }

  const recipient = process.env.TEST_EMAIL_RECIPIENT || DEFAULT_TEST_RECIPIENT;
  
  console.log(`Brevo API Key: ${process.env.BREVO_API_KEY.substring(0, 5)}...${process.env.BREVO_API_KEY.substring(process.env.BREVO_API_KEY.length - 5)}`);
  console.log(`Test recipient: ${recipient}`);
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h1 style="color: #4a90e2;">Brevo Test Email</h1>
      <p>This is a test email sent using Brevo from your Venezuelan Raffle Website application.</p>
      <p>If you received this email, your Brevo configuration is working correctly!</p>
      <p>Time: ${new Date().toISOString()}</p>
    </div>
  `;

  try {
    console.log('Sending test email...');
    
    await sendBrevoEmail({
      to: recipient,
      subject: 'Brevo Test - Venezuelan Raffle Website',
      html: htmlContent
    });
    
    console.log('\n✅ SUCCESS: Test email sent successfully!');
    console.log('Check your inbox to verify the email was received.');
    
  } catch (error) {
    console.error('\n❌ ERROR: Failed to send test email');
    console.error('Error details:', error.message);
    
    if (error.response) {
      console.error('API response:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

// Run the test
testBrevoEmail();
