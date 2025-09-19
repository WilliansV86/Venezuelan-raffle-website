// Full debug email test script
require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create log file
const logFile = path.join(__dirname, 'email-debug.log');
fs.writeFileSync(logFile, `Email Debug Log - ${new Date().toISOString()}\n\n`, 'utf8');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, logMessage, 'utf8');
}

log('==== ENVIRONMENT CHECK ====');
const envKeys = Object.keys(process.env).filter(key => key.startsWith('EMAIL_'));
log(`Found ${envKeys.length} email-related environment variables:`);
envKeys.forEach(key => {
  const value = key === 'EMAIL_PASS' ? '********' : process.env[key];
  log(`- ${key}: ${value}`);
});

// Test both SendGrid and direct configurations
async function testAllConfigurations() {
  // Test 1: Using env variables
  log('\n==== TEST 1: USING ENV VARIABLES ====');
  await testEmailConfiguration({
    name: '.env configuration',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
    secure: process.env.EMAIL_PORT == 465
  });
  
  // Test 2: Using direct SendGrid with port 587
  log('\n==== TEST 2: DIRECT SENDGRID (PORT 587) ====');
  await testEmailConfiguration({
    name: 'Direct SendGrid 587',
    host: 'smtp.sendgrid.net',
    port: 587,
    user: 'apikey',
    pass: process.env.EMAIL_PASS || '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',
    from: process.env.EMAIL_FROM || 'tusuerteestaaquive@gmail.com',
    secure: false
  });
  
  // Test 3: Using direct SendGrid with port 465
  log('\n==== TEST 3: DIRECT SENDGRID (PORT 465) ====');
  await testEmailConfiguration({
    name: 'Direct SendGrid 465',
    host: 'smtp.sendgrid.net',
    port: 465,
    user: 'apikey',
    pass: process.env.EMAIL_PASS || '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',
    from: process.env.EMAIL_FROM || 'tusuerteestaaquive@gmail.com',
    secure: true
  });
  
  // Test 4: Using direct SendGrid with TLS options
  log('\n==== TEST 4: SENDGRID WITH TLS OPTIONS ====');
  await testEmailConfiguration({
    name: 'SendGrid with TLS options',
    host: 'smtp.sendgrid.net',
    port: 587,
    user: 'apikey',
    pass: process.env.EMAIL_PASS || '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',
    from: process.env.EMAIL_FROM || 'tusuerteestaaquive@gmail.com',
    secure: false,
    useTLS: true
  });
  
  log('\n==== ALL TESTS COMPLETED ====');
  log(`Results saved to: ${logFile}`);
}

async function testEmailConfiguration(config) {
  log(`Testing email configuration: ${config.name}`);
  log(`Host: ${config.host}, Port: ${config.port}, Secure: ${config.secure}`);
  
  try {
    // Create transport options
    const transportOptions = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass
      },
      debug: true,
      logger: true
    };
    
    // Add TLS options if specified
    if (config.useTLS) {
      transportOptions.tls = {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      };
      log('Added TLS options with rejectUnauthorized: false');
    }
    
    // Create transporter
    log('Creating transporter...');
    const transporter = nodemailer.createTransport(transportOptions);
    
    // Try to verify connection
    log('Verifying SMTP connection...');
    try {
      await transporter.verify();
      log('✓ SMTP connection verified successfully');
    } catch (verifyError) {
      log(`✗ SMTP verification failed: ${verifyError.message}`);
      if (verifyError.code) log(`Error code: ${verifyError.code}`);
      throw verifyError;
    }
    
    // Try to send test email
    const mailOptions = {
      from: config.from,
      to: config.from, // Send to self
      subject: `Email Test (${config.name})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0;">
          <h2>Test Email from Configuration: ${config.name}</h2>
          <p>This email was sent using the following configuration:</p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>Secure: ${config.secure}</li>
            <li>Time: ${new Date().toISOString()}</li>
          </ul>
        </div>
      `
    };
    
    log(`Attempting to send email to ${mailOptions.to}...`);
    const info = await transporter.sendMail(mailOptions);
    
    log('✓ EMAIL SENT SUCCESSFULLY!');
    log(`Message ID: ${info.messageId}`);
    if (info.response) log(`Response: ${info.response}`);
    
    return true;
  } catch (error) {
    log(`✗ EMAIL SENDING FAILED FOR ${config.name}`);
    log(`Error message: ${error.message}`);
    if (error.code) log(`Error code: ${error.code}`);
    
    // Additional diagnostics
    if (error.code === 'ESOCKET') {
      log('This is a socket connection error, possibly due to:');
      log('1. Network firewall blocking the connection');
      log('2. Anti-virus or security software blocking SMTP');
      log('3. No internet connection or DNS issues');
    } else if (error.code === 'EAUTH') {
      log('This is an authentication error, possibly due to:');
      log('1. Incorrect username or password/API key');
      log('2. API key has been revoked or lacks permissions');
    }
    
    return false;
  }
}

// Run all tests
testAllConfigurations()
  .then(() => {
    log('Email diagnostics completed');
  })
  .catch(err => {
    log(`Unexpected error during testing: ${err.message}`);
  });
