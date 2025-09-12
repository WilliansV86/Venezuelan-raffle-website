// Debug script for Brevo email service
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Function to check configuration
function checkConfiguration() {
  console.log('\n==== CHECKING BREVO CONFIGURATION ====');
  
  // Check API key
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ ERROR: BREVO_API_KEY not found in .env file');
    return false;
  }
  
  console.log('✓ BREVO_API_KEY found:', process.env.BREVO_API_KEY.substring(0, 10) + '...');
  console.log('✓ BREVO_API_KEY length:', process.env.BREVO_API_KEY.length);
  
  return true;
}

// Function to send a test email
async function sendTestEmail() {
  console.log('\n==== SENDING TEST EMAIL WITH VERBOSE LOGGING ====');
  
  try {
    // Setup client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    console.log('✓ API client configured');
    
    // Create API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    console.log('✓ TransactionalEmailsApi instance created');
    
    // Define sender with simple email only (no display name)
    const sender = {
      email: 'tusuerteestaaquive@gmail.com'
      // No name field to avoid format issues
    };
    console.log('✓ Sender configured:', sender);
    
    // Define recipient (send to self)
    const recipient = {
      email: process.env.EMAIL_FROM || 'tusuerteestaaquive@gmail.com',
      name: 'Test Recipient'
    };
    console.log('✓ Recipient configured:', recipient);
    
    // Create test email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = 'Debug Test Email from Venezuelan Raffle Website';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4a90e2;">Debug Test Email</h1>
        <p>This is a debug test email sent at: ${new Date().toISOString()}</p>
        <p>If you received this email, your Brevo integration is working!</p>
      </div>
    `;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = [recipient];
    
    console.log('✓ Email payload prepared');
    console.log('\nAttempting to send email to:', recipient.email);
    
    // Send email and get response
    console.log('Making API call to Brevo...');
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('\n✅ SUCCESS! Email sent successfully!');
    console.log('Message ID:', data.messageId);
    console.log('Full response:', JSON.stringify(data, null, 2));
    console.log('\nCheck your inbox to verify the email was received');
    
  } catch (error) {
    console.error('\n❌ ERROR: Email sending failed');
    console.error('Error details:', error.message);
    
    if (error.response && error.response.body) {
      console.error('API response:', JSON.stringify(error.response.body, null, 2));
    }
    
    // More detailed error analysis
    if (error.message.includes('Unauthorized')) {
      console.error('\n🔑 This appears to be an API key authentication issue.');
      console.error('- Verify that your Brevo API key is correct');
      console.error('- Check that your account is active');
      console.error('- Ensure the API key has send email permissions');
    }
    
    if (error.message.includes('timeout')) {
      console.error('\n🌐 This appears to be a network issue.');
      console.error('- Check your internet connection');
      console.error('- Verify if there are any firewall rules blocking the connection');
    }
  }
}

// Main function
async function main() {
  console.log('==== BREVO EMAIL DEBUG TOOL ====');
  
  if (checkConfiguration()) {
    await sendTestEmail();
  } else {
    console.error('\nCannot proceed with email test due to configuration issues.');
  }
}

// Run the main function
main();
