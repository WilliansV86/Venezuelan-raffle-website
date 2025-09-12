// Direct Email Configuration Test
require('dotenv').config();
const fs = require('fs');

// Output log file
const logFile = './email-test-results.log';
fs.writeFileSync(logFile, `=== EMAIL CONFIGURATION TEST (${new Date().toISOString()}) ===\n\n`, 'utf8');

function log(message) {
  console.log(message);
  fs.appendFileSync(logFile, message + '\n', 'utf8');
}

// Test SMTP connectivity
async function testSMTP() {
  try {
    log('\n=== TESTING SMTP CONNECTION ===');
    
    const net = require('net');
    const host = process.env.EMAIL_HOST || 'smtp.sendgrid.net';
    const port = process.env.EMAIL_PORT || 587;
    
    log(`Attempting to connect to ${host}:${port}...`);
    
    const socket = net.createConnection(port, host);
    
    socket.on('connect', () => {
      log('✓ SMTP CONNECTION SUCCESSFUL');
      socket.end();
    });
    
    socket.on('error', (err) => {
      log(`✗ SMTP CONNECTION FAILED: ${err.message}`);
    });
    
    // Wait for connection attempt
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (error) {
    log(`Error testing SMTP connection: ${error.message}`);
  }
}

// Test SendGrid API
async function testSendGridAPI() {
  log('\n=== TESTING SENDGRID API ===');
  
  try {
    const sgMail = require('@sendgrid/mail');
    log('SendGrid package loaded successfully');
    
    const apiKey = process.env.EMAIL_PASS;
    if (!apiKey) {
      log('✗ NO API KEY FOUND in EMAIL_PASS');
      return;
    }
    
    log('Setting API key...');
    sgMail.setApiKey(apiKey);
    
    const testMsg = {
      to: process.env.EMAIL_FROM || 'test@example.com',
      from: process.env.EMAIL_FROM || 'test@example.com',
      subject: 'API Test',
      text: 'This is a test from SendGrid API',
    };
    
    try {
      log('Sending test email via API...');
      await sgMail.send(testMsg);
      log('✓ SENDGRID API TEST SUCCESSFUL');
    } catch (err) {
      log(`✗ SENDGRID API SEND FAILED: ${err.message}`);
      if (err.response) {
        log(`Error code: ${err.code}`);
        log(`Response body: ${JSON.stringify(err.response.body)}`);
      }
    }
  } catch (err) {
    log(`Error loading SendGrid package: ${err.message}`);
  }
}

// Examine environment variables
function checkEnvironment() {
  log('\n=== CHECKING ENVIRONMENT VARIABLES ===');
  
  const requiredVars = {
    'EMAIL_HOST': process.env.EMAIL_HOST,
    'EMAIL_PORT': process.env.EMAIL_PORT,
    'EMAIL_USER': process.env.EMAIL_USER,
    'EMAIL_PASS': process.env.EMAIL_PASS ? '********' : undefined,
    'EMAIL_FROM': process.env.EMAIL_FROM,
    'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY ? '********' : undefined
  };
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      log(`✗ ${key}: MISSING`);
    } else {
      log(`✓ ${key}: ${value}`);
    }
  }
  
  // Special check for SendGrid
  if (process.env.EMAIL_HOST === 'smtp.sendgrid.net') {
    log('\n- SendGrid specific checks:');
    
    // Check if EMAIL_USER is "apikey"
    if (process.env.EMAIL_USER !== 'apikey') {
      log(`✗ EMAIL_USER should be exactly "apikey" for SendGrid, but got "${process.env.EMAIL_USER}"`);
    } else {
      log('✓ EMAIL_USER correctly set to "apikey"');
    }
    
    // Check if API key format looks correct
    if (process.env.EMAIL_PASS && !process.env.EMAIL_PASS.startsWith('SG.')) {
      log('✗ EMAIL_PASS does not look like a valid SendGrid API key (should start with "SG.")');
    } else if (process.env.EMAIL_PASS) {
      log('✓ EMAIL_PASS appears to be in correct SendGrid format');
    }
  }
}

// Run all tests
async function runAllTests() {
  log('Starting comprehensive email configuration test...');
  
  checkEnvironment();
  await testSMTP();
  await testSendGridAPI();
  
  log('\n=== TEST COMPLETE ===');
  log(`Detailed results saved to: ${logFile}`);
}

runAllTests();
