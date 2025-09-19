/**
 * Email Diagnostics Tool
 * 
 * This script tests the email functionality by:
 * 1. Checking environment variables
 * 2. Validating SendGrid configuration
 * 3. Attempting to send a test email
 * 4. Providing detailed error output
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
};

// Utility for console logging
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  section: (title) => console.log(`\n${colors.cyan}===== ${title} =====${colors.reset}`),
  result: (success) => console.log(`${success ? colors.bgGreen : colors.bgRed}[RESULT: ${success ? 'PASS' : 'FAIL'}]${colors.reset}`)
};

// Email configuration variables
const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];

// File paths to check for .env files
const envPaths = [
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '.env.example'),
  path.join(__dirname, '..', '.env.fixed'),
  path.join(__dirname, '..', '.env.new')
];

// Function to check environment variables
async function checkEnvironment() {
  log.section('Environment Variables Check');
  
  // Check Node.js version
  const nodeVersion = process.version;
  log.info(`Node.js Version: ${nodeVersion}`);
  
  // Check for .env files
  log.info('Checking for .env files:');
  envPaths.forEach(envPath => {
    if (fs.existsSync(envPath)) {
      log.success(`Found: ${path.basename(envPath)}`);
    } else {
      log.warning(`Not found: ${path.basename(envPath)}`);
    }
  });
  
  // Check for required environment variables
  let allVarsPresent = true;
  let missingVars = [];
  
  log.info('Checking required environment variables:');
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      const value = varName === 'EMAIL_PASS' ? '********' : process.env[varName];
      log.success(`${varName}: ${value}`);
    } else {
      log.error(`${varName}: Not defined`);
      allVarsPresent = false;
      missingVars.push(varName);
    }
  });
  
  if (!allVarsPresent) {
    log.error(`Missing environment variables: ${missingVars.join(', ')}`);
    log.result(false);
    return false;
  }
  
  log.result(true);
  return true;
}

// Function to validate SendGrid configuration
async function validateConfig() {
  log.section('SendGrid Configuration Validation');
  
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = parseInt(process.env.EMAIL_PORT);
  const emailUser = process.env.EMAIL_USER;
  
  // Check if host is SendGrid
  if (emailHost !== 'smtp.sendgrid.net') {
    log.warning(`Host is not set to SendGrid's SMTP server (smtp.sendgrid.net)`);
  } else {
    log.success('Email host is correctly set to SendGrid SMTP server');
  }
  
  // Check port
  if (emailPort !== 587 && emailPort !== 465) {
    log.warning(`Port ${emailPort} is not one of the standard SendGrid SMTP ports (587, 465)`);
  } else {
    log.success(`Email port is correctly set to ${emailPort}`);
  }
  
  // Check SendGrid API Key format
  if (emailUser !== 'apikey') {
    log.warning('For SendGrid, EMAIL_USER should be set to "apikey"');
  } else {
    log.success('EMAIL_USER is correctly set to "apikey"');
  }
  
  // Check if EMAIL_PASS looks like a SendGrid API key
  const apiKeyRegex = /^SG\..+/;
  if (!apiKeyRegex.test(process.env.EMAIL_PASS)) {
    log.warning('EMAIL_PASS does not appear to be a valid SendGrid API key (should start with "SG.")');
  } else {
    log.success('EMAIL_PASS appears to be a valid SendGrid API key');
  }
  
  log.result(true);
  return true;
}

// Function to send a test email
async function sendTestEmail() {
  log.section('Email Sending Test');
  
  try {
    // Create transport configuration
    const transportConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true
    };
    
    log.info('Creating transporter with configuration:');
    console.log(JSON.stringify({
      host: transportConfig.host,
      port: transportConfig.port,
      secure: transportConfig.secure,
      auth: {
        user: transportConfig.auth.user,
        pass: '********'
      }
    }, null, 2));
    
    // Create transporter
    const transporter = nodemailer.createTransport(transportConfig);
    
    log.info('Verifying transporter...');
    
    // Verify the connection
    await transporter.verify();
    log.success('Transporter verified successfully');
    
    // Define email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_FROM, // Send to self for testing
      subject: 'Email Diagnostic Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
          <h1 style="color: #4a90e2;">Email Diagnostic Test</h1>
          <p>This email confirms that your email configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <hr>
          <p style="color: #888; font-size: 12px;">This is an automated test email from the Venezuelan Raffle Website.</p>
        </div>
      `
    };
    
    log.info(`Sending email to: ${mailOptions.to}`);
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    log.success('Email sent successfully!');
    log.info(`Message ID: ${info.messageId}`);
    log.info(`Response: ${info.response}`);
    
    log.result(true);
    return true;
  } catch (error) {
    log.error('Failed to send test email');
    log.error(`Error: ${error.message}`);
    if (error.code) log.error(`Error Code: ${error.code}`);
    
    // Provide suggestions based on error
    if (error.code === 'EAUTH') {
      log.info('Suggestion: Your authentication credentials (API key) may be incorrect');
    } else if (error.code === 'ESOCKET') {
      log.info('Suggestion: Network connectivity issue or incorrect port');
    } else if (error.code === 'ECONNECTION') {
      log.info('Suggestion: Cannot connect to the SMTP server, check host and port');
    }
    
    log.result(false);
    return false;
  }
}

// Main function to run all tests
async function runDiagnostics() {
  log.section('Starting Email Diagnostics');
  log.info(`Time: ${new Date().toISOString()}`);
  log.info(`Working Directory: ${process.cwd()}`);
  
  try {
    // Run each test in sequence
    const envCheck = await checkEnvironment();
    if (!envCheck) {
      log.error('Environment check failed - cannot proceed');
      return;
    }
    
    const configValid = await validateConfig();
    
    // Continue with send test even if config validation has warnings
    const sendResult = await sendTestEmail();
    
    // Final result
    log.section('Diagnostic Summary');
    log.info(`Environment Check: ${envCheck ? colors.green + 'PASS' + colors.reset : colors.red + 'FAIL' + colors.reset}`);
    log.info(`Config Validation: ${configValid ? colors.green + 'PASS' + colors.reset : colors.yellow + 'WARNING' + colors.reset}`);
    log.info(`Email Send Test: ${sendResult ? colors.green + 'PASS' + colors.reset : colors.red + 'FAIL' + colors.reset}`);
    
    if (envCheck && sendResult) {
      log.success('All email functionality appears to be working correctly!');
    } else {
      log.warning('Some issues were detected with the email configuration or sending.');
    }
  } catch (error) {
    log.error('Unexpected error during diagnostics');
    log.error(error);
  }
}

// Run the diagnostics
runDiagnostics()
  .then(() => {
    log.info('Email diagnostics completed');
  })
  .catch(error => {
    log.error('Fatal error in diagnostics');
    log.error(error);
  });
