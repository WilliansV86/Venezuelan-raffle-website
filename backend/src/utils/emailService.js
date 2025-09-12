const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
let sgMail;

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file for debugging
const logFile = path.join(logDir, 'email-service.log');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(logFile, logMessage, 'utf8');
}

// Try to load SendGrid API package
try {
  sgMail = require('@sendgrid/mail');
  logToFile('SendGrid API package loaded successfully');
} catch (err) {
  logToFile(`SendGrid API package not available, will use SMTP fallback: ${err.message}`);
}

/**
 * Send email with detailed logging and retry mechanism
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email content
 * @param {number} [options.retries=2] - Number of retry attempts
 * @returns {Promise} - Email sending result
 */
const sendEmail = async ({ to, subject, html, retries = 2 }) => {
  // Start a new log session for this email attempt
  logToFile(`\n==== EMAIL SENDING ATTEMPT (${new Date().toISOString()}) ====`);
  logToFile(`To: ${to}`);
  logToFile(`Subject: ${subject}`);
  
  try {
    // Check required environment variables with detailed feedback
    if (!process.env.EMAIL_PASS) {
      logToFile('ERROR: EMAIL_PASS (SendGrid API key) is required');
      throw new Error('EMAIL_PASS (SendGrid API key) is required');
    }
    
    if (!process.env.EMAIL_FROM) {
      logToFile('ERROR: EMAIL_FROM is required');
      throw new Error('EMAIL_FROM is required');
    }
    
    // Validate SendGrid API key format
    if (process.env.EMAIL_PASS && !process.env.EMAIL_PASS.startsWith('SG.')) {
      logToFile('WARNING: EMAIL_PASS does not appear to be a valid SendGrid API key (should start with SG.)');
    }

    logToFile(`Sending email to: ${to}`);
    logToFile(`Subject: ${subject}`);
    logToFile(`From: ${process.env.EMAIL_FROM}`);
    
    // Prepare message object (used by both methods)
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: html,
    };
    
    // Add debugging metadata
    const emailId = `email-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    mailOptions.messageId = `<${emailId}@venezuelan-raffle.com>`;
    logToFile(`Generated message ID: ${mailOptions.messageId}`);
    
    // Try SendGrid Web API first if available
    if (sgMail) {
      try {
        logToFile('Attempting to send via SendGrid Web API...');
        
        // Verify API key before attempting to send
        if (!process.env.EMAIL_PASS) {
          throw new Error('SendGrid API key not found');
        }
        
        // Set API key and add debug mode
        sgMail.setApiKey(process.env.EMAIL_PASS);
        
        // Add SendGrid-specific headers for better tracking
        const sgMailOptions = {...mailOptions};
        sgMailOptions.trackingSettings = {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        };
        
        logToFile('Sending email via SendGrid API now...');
        const response = await sgMail.send(sgMailOptions);
        
        // Log detailed success information
        logToFile('✓ Email sent successfully via SendGrid Web API');
        if (response && response[0] && response[0].statusCode) {
          logToFile(`SendGrid response status: ${response[0].statusCode}`);
        }
        
        return response;
      } catch (sgError) {
        logToFile(`✗ SendGrid Web API sending failed: ${sgError.message}`);
        
        // Log detailed SendGrid API error information
        if (sgError.response && sgError.response.body) {
          const errorDetails = JSON.stringify(sgError.response.body);
          logToFile(`SendGrid API error details: ${errorDetails}`);
        }
        
        logToFile('Will try SMTP fallback method...');
        // Fall through to SMTP method
      }
    } else {
      logToFile('SendGrid API package not available, proceeding with SMTP method');
    }
    
    // Fallback to SMTP method if API fails or is unavailable
    logToFile('Attempting to use SMTP method...');
    
    // Check SMTP specific configuration
    const smtpRequiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER'];
    const missingSmtpVars = smtpRequiredVars.filter(varName => !process.env[varName]);
    
    if (missingSmtpVars.length > 0) {
      const errorMsg = `SMTP configuration incomplete. Missing: ${missingSmtpVars.join(', ')}`;
      logToFile(`✗ ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    // Log SMTP configuration
    logToFile('Creating SMTP transporter with configuration:');
    logToFile(`Host: ${process.env.EMAIL_HOST}`);
    logToFile(`Port: ${process.env.EMAIL_PORT}`);
    logToFile(`Secure: ${process.env.EMAIL_PORT == 465}`);
    logToFile(`User: ${process.env.EMAIL_USER}`);
    
    // Create enhanced SMTP transporter with better compatibility options
    const transporterOptions = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Enhanced TLS options for better compatibility
      tls: {
        rejectUnauthorized: false,  // Accept self-signed certificates
        minVersion: 'TLSv1'  // Support older TLS versions
      },
      // Enable debug for more information
      debug: true,
      logger: true
    };
    
    logToFile('Creating nodemailer transport...');
    const transporter = nodemailer.createTransport(transporterOptions);
    
    try {
      // Verify connection configuration
      logToFile('Verifying SMTP connection...');
      await transporter.verify();
      logToFile('✓ SMTP connection verified');
    } catch (verifyError) {
      logToFile(`✗ SMTP connection verification failed: ${verifyError.message}`);
      // Continue anyway - some providers reject verify but accept sending
    }

    // Send via SMTP
    logToFile('Sending email via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    logToFile(`✓ Email sent successfully via SMTP. Message ID: ${info.messageId}`);
    if (info.response) {
      logToFile(`SMTP Response: ${info.response}`);
    }
    return info;

  } catch (error) {
    logToFile('\n--- EMAIL SENDING FAILED (ALL METHODS) ---');
    logToFile(`Error: ${error.message}`);
    if (error.code) logToFile(`Error code: ${error.code}`);
    if (error.stack) logToFile(`Stack trace: ${error.stack.split('\n')[0]}`);
    
    // Add helpful diagnostic information
    if (error.code === 'ESOCKET' || error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      logToFile('This appears to be a network connectivity issue:');
      logToFile('- Check firewall settings that might block SMTP');
      logToFile('- Ensure outbound connections to SendGrid are allowed');
      logToFile('- Try using a different network connection');
    } else if (error.code === 'EAUTH') {
      logToFile('This appears to be an authentication issue:');
      logToFile('- Verify your SendGrid API key is correct and active');
      logToFile('- Check if SendGrid API key has proper permissions');
      logToFile('- Confirm EMAIL_USER is set to "apikey" for SendGrid');
    } else if (error.message && error.message.includes('certificate')) {
      logToFile('This appears to be a TLS/SSL certificate issue');
      logToFile('- Check if your server has up-to-date CA certificates');
    }
    
    // Retry logic for transient errors
    if (retries > 0 && (
      error.code === 'ESOCKET' || 
      error.code === 'ECONNECTION' || 
      error.code === 'ETIMEDOUT' || 
      error.code === 'EENVELOPE' ||
      error.message.includes('timeout')
    )) {
      logToFile(`Retrying email send... (${retries} attempts left)`);
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sendEmail({ to, subject, html, retries: retries - 1 });
    }
    
    // Log that we're giving up
    logToFile('Giving up on sending this email after all attempts failed');
    logToFile(`See full log at: ${logFile}`);
    
    // Re-throw to notify the calling function
    throw new Error('Failed to send email: ' + (error.message || 'Unknown error'));
  }
};

// Export email-related functions
module.exports = { 
  sendEmail,
  logToFile 
};
