/**
 * SendGrid Web API Email Service
 * An alternative to the SMTP-based email service that uses SendGrid's API
 */

// Check if we have the dependency
let sendgridMail;
try {
  sendgridMail = require('@sendgrid/mail');
} catch (err) {
  console.error('SendGrid Mail package not found. Please install using: npm install @sendgrid/mail');
}

/**
 * Send email using SendGrid Web API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of email
 * @returns {Promise} - Promise resolving to SendGrid response
 */
const sendGridEmail = async ({ to, subject, html }) => {
  try {
    // Check if SendGrid is available
    if (!sendgridMail) {
      throw new Error('SendGrid dependency not installed. Run: npm install @sendgrid/mail');
    }
    
    // Check if API key exists
    if (!process.env.EMAIL_PASS && !process.env.SENDGRID_API_KEY) {
      throw new Error('No SendGrid API key found in environment variables');
    }
    
    // Set API key (use either EMAIL_PASS or SENDGRID_API_KEY)
    const apiKey = process.env.SENDGRID_API_KEY || process.env.EMAIL_PASS;
    sendgridMail.setApiKey(apiKey);
    
    // Log steps
    console.log('SendGrid Web API: Preparing to send email');
    console.log(`From: ${process.env.EMAIL_FROM}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    
    // Create message
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html,
    };
    
    // Send email
    console.log('Sending email via SendGrid Web API...');
    const response = await sendgridMail.send(msg);
    
    console.log('Email sent successfully via SendGrid Web API');
    return response;
  } catch (error) {
    console.error('--- SENDGRID EMAIL SENDING FAILED ---');
    console.error('Error details:', error);
    
    // Show detailed error info
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
    
    throw new Error(`Failed to send email via SendGrid API: ${error.message}`);
  }
};

module.exports = { sendGridEmail };
