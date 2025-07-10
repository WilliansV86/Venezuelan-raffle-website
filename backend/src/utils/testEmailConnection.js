/**
 * Email Connection Test Utility
 * 
 * This script tests the email service connection and sending functionality
 * Run with: node src/utils/testEmailConnection.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailConnection() {
  console.log('Testing email connection...');
  
  // Check if environment variables are set
  const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
    'EMAIL_FROM_NAME'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing email environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('Please check your .env file and add the missing variables');
    return { success: false, missingVars };
  }
  
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Verify connection configuration
    console.log('Verifying email server connection...');
    await transporter.verify();
    console.log('✅ Email server connection successful!');
    console.log(`   Server: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
    
    // Send a test email if ADMIN_EMAIL is set
    if (process.env.ADMIN_EMAIL) {
      console.log('\nSending test email to admin...');
      
      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "Test Email from Venezuelan Raffle Website",
        text: "This is a test email sent by the Venezuelan Raffle Website's email configuration checker.",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #0066cc;">Email Configuration Test</h2>
            <p>This is a test email sent by the Venezuelan Raffle Website's email configuration checker.</p>
            <p>If you're seeing this email, your email service is correctly configured!</p>
            <hr style="border: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is an automated message sent at ${new Date().toISOString()}</p>
          </div>
        `
      });
      
      console.log('✅ Test email sent successfully!');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Sent to: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log('\nℹ️  ADMIN_EMAIL not set, skipping test email send');
    }
    
    return { 
      success: true,
      emailHost: process.env.EMAIL_HOST,
      emailPort: process.env.EMAIL_PORT,
      emailUser: process.env.EMAIL_USER,
      emailFrom: process.env.EMAIL_FROM
    };
  } catch (error) {
    console.error('❌ Email connection error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - check your EMAIL_HOST and EMAIL_PORT');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timeout - check your EMAIL_HOST and EMAIL_PORT');
    } else if (error.code === 'EAUTH') {
      console.error('Authentication failed - check your EMAIL_USER and EMAIL_PASSWORD');
      if (process.env.EMAIL_HOST.includes('gmail')) {
        console.error('\nIf using Gmail, make sure you:');
        console.error('1. Have enabled "Less secure app access" or');
        console.error('2. Are using an App Password (recommended for 2FA accounts)');
        console.error('See: https://support.google.com/accounts/answer/185833');
      }
    }
    
    return { success: false, error: error.message };
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testEmailConnection()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testEmailConnection;
