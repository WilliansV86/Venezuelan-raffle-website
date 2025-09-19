// Verbose Gmail Test Script with Complete Error Logging
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmailVerbose() {
  console.log('\n======== VERBOSE GMAIL TEST ========');
  
  // Check environment variables first
  console.log('1. Checking environment variables...');
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  
  if (!gmailUser) {
    console.error('❌ ERROR: GMAIL_USER is not defined in .env file');
    return;
  } else {
    console.log(`✓ GMAIL_USER found: ${gmailUser}`);
  }
  
  if (!gmailPass) {
    console.error('❌ ERROR: GMAIL_PASS is not defined in .env file');
    return;
  } else {
    console.log(`✓ GMAIL_PASS found: ${gmailPass.substring(0, 3)}*******${gmailPass.substring(gmailPass.length - 3)}`);
    console.log(`✓ GMAIL_PASS length: ${gmailPass.length} characters`);
    
    if (gmailPass.includes(' ')) {
      console.error('❌ WARNING: GMAIL_PASS contains spaces. Remove all spaces from the App Password');
    } else {
      console.log('✓ GMAIL_PASS format looks correct (no spaces)');
    }
    
    if (gmailPass.length !== 16) {
      console.error(`❌ WARNING: GMAIL_PASS should be 16 characters, but is ${gmailPass.length} characters`);
    } else {
      console.log('✓ GMAIL_PASS length is correct (16 characters)');
    }
  }
  
  // Create test email content
  const recipient = gmailUser; // Send to self for testing
  const subject = 'Gmail Test with Verbose Logging';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
      <h1 style="color: #4a90e2;">Gmail Test Email (Verbose)</h1>
      <p>This is a test email sent at: ${new Date().toISOString()}</p>
      <p>If you received this email, your Gmail configuration is working!</p>
    </div>
  `;
  
  console.log('\n2. Creating transporter with nodemailer...');
  try {
    // Create transporter with detailed logs
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      },
      debug: true, // Enable verbose logging
      logger: true, // Log to console
      tls: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✓ Transporter created successfully');
    
    console.log('\n3. Verifying SMTP connection...');
    try {
      await transporter.verify();
      console.log('✓ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:');
      console.error(verifyError);
    }
    
    console.log('\n4. Attempting to send email...');
    console.log(`   To: ${recipient}`);
    console.log(`   Subject: ${subject}`);
    
    const mailOptions = {
      from: gmailUser,
      to: recipient,
      subject: subject,
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('\n✅ SUCCESS: Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('\nCheck your inbox for the test email.');
    
  } catch (error) {
    console.error('\n❌ ERROR: Email sending failed');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failure. Please check:');
      console.error('1. Your Gmail account has 2-Step Verification enabled');
      console.error('2. You\'re using an App Password (not your regular password)');
      console.error('3. The App Password is correct and has no spaces');
      console.error('\nNote: Google may block sign-in attempts from apps it deems less secure.');
      console.error('Visit https://myaccount.google.com/security to:');
      console.error('- Confirm 2-Step Verification is ON');
      console.error('- Generate a new App Password under "App passwords"');
    }
    
    if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.error('\nConnection error. Please check:');
      console.error('1. Your network connection');
      console.error('2. Any firewalls or security software that might be blocking SMTP');
    }
  }
}

// Run the test
testGmailVerbose();
