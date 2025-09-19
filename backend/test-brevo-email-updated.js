// Updated Brevo Email Test Script using sib-api-v3-sdk
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Test email sending function
async function testBrevoEmailSending() {
  console.log('\n==== BREVO EMAIL TEST ====');
  
  try {
    // Check API key
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ ERROR: BREVO_API_KEY not found in .env file');
      return;
    }
    
    console.log('✓ BREVO_API_KEY found in environment variables');
    
    // Setup client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    // Create API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    // Define sender (using existing EMAIL_FROM or default)
    const sender = {
      email: process.env.EMAIL_FROM || 'tusuerteestaaquive@gmail.com',
      name: 'Tu Suerte Está Aquí'
    };
    
    // Define recipient (send to self)
    const recipient = {
      email: process.env.EMAIL_FROM || 'tusuerteestaaquive@gmail.com',
      name: 'Test Recipient'
    };
    
    // Create test email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Test Email from Venezuelan Raffle Website';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4a90e2;">Email Test Successful!</h1>
        <p>This is a test email sent at: ${new Date().toISOString()}</p>
        <p>Your Brevo integration is working correctly!</p>
        <p>Now you can approve transactions and emails will be sent to customers.</p>
      </div>
    `;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = [recipient];
    
    console.log('Sending test email to:', recipient.email);
    console.log('From:', sender.email);
    
    // Send email and get response
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('\n✅ SUCCESS! Email sent successfully!');
    console.log('Message ID:', data.messageId);
    console.log('\nCheck your inbox to verify the email was received');
    
  } catch (error) {
    console.error('\n❌ ERROR: Email sending failed');
    console.error('Error details:', error.message);
    
    if (error.response && error.response.body) {
      console.error('API response:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

// Run the test
testBrevoEmailSending();
