/**
 * Brevo Email Service - Alternative to SendGrid
 * No domain authentication required, free tier allows 300 emails/day
 */
const SibApiV3Sdk = require('sib-api-v3-sdk');

/**
 * Send email using Brevo's API
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email content
 * @returns {Promise} - Email sending result
 */
const sendBrevoEmail = async ({ to, subject, html }) => {
  try {
    console.log('==== Using Brevo Email Service ====');
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    
    // Check for required Brevo-specific configuration
    if (!process.env.BREVO_API_KEY) {
      throw new Error('Brevo configuration missing. Set BREVO_API_KEY in .env file');
    }
    
    // Set up the Brevo client
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    // Create sender with custom From name but using the same email
    const sender = {
      email: 'tusuerteestaaquive@gmail.com',
      name: 'Tu Suerte Está Aquí'
    };
    
    // Create API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    
    // Prepare the email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = [{
      email: to,
      name: to.split('@')[0] // Use part before @ as name
    }];
    
    console.log('Attempting to send via Brevo...');
    
    // Send the email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully via Brevo. Message ID:', response.messageId);
    return response;
    
  } catch (error) {
    console.error('--- BREVO EMAIL SENDING FAILED ---');
    console.error('Error details:', error);
    
    if (error.response) {
      console.error('API response error:', error.response.body);
    }
    
    throw new Error('Failed to send email via Brevo: ' + error.message);
  }
};

module.exports = { sendBrevoEmail };
