// SendGrid Web API Test
require('dotenv').config();

// Try to load @sendgrid/mail
let sgMail;
try {
  sgMail = require('@sendgrid/mail');
  console.log('SendGrid package loaded successfully');
} catch (err) {
  console.error('ERROR: SendGrid package not installed. Please run install-sendgrid-api.bat first');
  console.error('Installation command: npm install @sendgrid/mail --save');
  process.exit(1);
}

// Function to test SendGrid Web API
async function testSendGridAPI() {
  console.log('--- Testing SendGrid Web API ---');
  
  // Check for API key
  const apiKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_PASS;
  if (!apiKey) {
    console.error('ERROR: No API key found in environment variables');
    console.error('Please ensure either SENDGRID_API_KEY or EMAIL_PASS is set in your .env file');
    return;
  }
  
  // Check if the API key looks like a SendGrid key
  if (!apiKey.startsWith('SG.')) {
    console.warn('WARNING: API key does not start with "SG." - it may not be a valid SendGrid API key');
  }
  
  // Set API key
  console.log('Setting API key...');
  sgMail.setApiKey(apiKey);
  
  // From address
  const fromEmail = process.env.EMAIL_FROM;
  if (!fromEmail) {
    console.error('ERROR: No EMAIL_FROM found in environment variables');
    return;
  }
  
  // Prepare message
  const msg = {
    to: fromEmail, // Send to self
    from: fromEmail,
    subject: 'SendGrid API Test',
    text: 'This is a test email using SendGrid Web API',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0;">
        <h2>SendGrid Web API Test</h2>
        <p>This email was sent using SendGrid's Web API instead of SMTP.</p>
        <p>If you received this email, the Web API is working correctly.</p>
        <p>Time: ${new Date().toISOString()}</p>
      </div>
    `
  };
  
  try {
    console.log(`Sending test email to ${msg.to}...`);
    const response = await sgMail.send(msg);
    
    console.log('--- SUCCESS ---');
    console.log('Email sent successfully via SendGrid Web API!');
    console.log('Status Code:', response[0].statusCode);
    if (response[0].headers) {
      console.log('X-Message-Id:', response[0].headers['x-message-id']);
    }
    
  } catch (error) {
    console.error('--- FAILED ---');
    console.error('Error sending email via SendGrid Web API:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Error Response Body:');
      console.error(JSON.stringify(error.response.body, null, 2));
    }
  }
}

// Run the test
console.log('Starting SendGrid Web API test...');
testSendGridAPI()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Unexpected error:', err));
