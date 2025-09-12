/**
 * Gmail Email Service - Alternative to SendGrid
 * Uses Gmail SMTP which often has better connectivity than SendGrid
 */
const nodemailer = require('nodemailer');

const sendGmailEmail = async ({ to, subject, html }) => {
  try {
    console.log('==== Using Gmail Service ====');
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    
    // Check for required Gmail-specific configuration
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      throw new Error('Gmail configuration missing. Set GMAIL_USER and GMAIL_PASS in .env');
    }
    
    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Uses Gmail's preconfigured settings
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Helps with certificate issues
      }
    });
    
    // Define mail options
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };
    
    console.log('Attempting to send via Gmail...');
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Gmail. Message ID:', info.messageId);
    return info;
    
  } catch (error) {
    console.error('--- GMAIL EMAIL SENDING FAILED ---');
    console.error('Error details:', error);
    
    // Provide helpful diagnostics
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Check your Gmail credentials.');
      console.error('For Gmail, you need to:');
      console.error('1. Enable "Less secure app access" in your Google account, or');
      console.error('2. Create an App Password if you have 2FA enabled');
    }
    
    throw new Error('Failed to send email via Gmail: ' + error.message);
  }
};

module.exports = { sendGmailEmail };
