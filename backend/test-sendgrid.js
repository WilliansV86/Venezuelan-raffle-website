/**
 * SendGrid Email Test Script
 * This script tests the SendGrid email service directly
 */

require('dotenv').config();
const https = require('https');

// Simple function to send email via SendGrid
async function sendTestEmail() {
  return new Promise((resolve, reject) => {
    console.log('Testing SendGrid email connection...');
    
    // Check if SendGrid API key is available
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SendGrid API key is missing');
      console.error('Please set the SENDGRID_API_KEY environment variable in your .env file');
      return reject(new Error('SendGrid API key is not available'));
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'tusuerteestaaquive@gmail.com';
    const toEmail = process.env.ADMIN_EMAIL || 'tusuerteestaaquive@gmail.com';
    
    console.log(`🔍 Using configuration:`);
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: ${toEmail}`);
    console.log(`   API Key: ${apiKey ? '✓ Set' : '❌ Missing'}`);
    
    // Prepare a simple email request
    const requestData = JSON.stringify({
      personalizations: [
        {
          to: [{ email: toEmail }],
          subject: 'SendGrid Test Email - Venezuelan Raffle Website',
        },
      ],
      from: { 
        email: fromEmail,
        name: 'Tu Suerte Está Aquí - Test'
      },
      content: [
        {
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
              <h2 style="color: #0066cc;">SendGrid Test Email</h2>
              <p>This is a test email sent directly via the SendGrid API.</p>
              <p>If you're seeing this email, your SendGrid configuration is working!</p>
              <p>Time sent: ${new Date().toLocaleString()}</p>
              <hr style="border: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">This is an automated test message</p>
            </div>
          `,
        },
      ],
    });

    // Set up the request options
    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestData),
      },
    };

    console.log('📨 Sending test email via SendGrid API...');

    // Create the request
    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Email sent successfully! Status code: ${res.statusCode}`);
          resolve({ success: true, status: res.statusCode });
        } else {
          console.error(`❌ SendGrid API error: ${res.statusCode} - ${responseBody}`);
          reject(new Error(`SendGrid API error: ${res.statusCode} - ${responseBody}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ SendGrid request error: ${error.message}`);
      reject(error);
    });

    // Send the request
    req.write(requestData);
    req.end();
  });
}

// Run the test
console.log('📧 SendGrid Email Test');
console.log('====================');
console.log('');

sendTestEmail()
  .then(result => {
    console.log('📬 Test completed successfully!');
    console.log('');
    console.log('Check your inbox (and spam folder) for the test email.');
    console.log('If you don\'t receive it within a few minutes, try these steps:');
    console.log('1. Verify your SendGrid API key is correct');
    console.log('2. Check if your SendGrid account is active');
    console.log('3. Verify that the sender email is authorized in SendGrid');
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('Troubleshooting tips:');
    console.log('1. Check your SendGrid API key in the .env file');
    console.log('2. Verify your SendGrid account is active and not suspended');
    console.log('3. Make sure the sender email domain is verified in SendGrid');
    console.log('4. Check if you\'ve reached your SendGrid sending limits');
  });
