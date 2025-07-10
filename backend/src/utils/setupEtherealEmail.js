/**
 * Set up Ethereal Email for testing
 */
require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../../.env');

// Function to update or add a setting in .env file
const updateSetting = (content, key, value) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return `${content}\n${key}=${value}`;
  }
};

async function setupEtherealEmail() {
  console.log('Setting up Ethereal Email (fake SMTP service for testing)...');
  
  try {
    // Create a test account
    console.log('Creating test account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('Test account created successfully!');
    
    // Save the credentials to .env file
    console.log('Updating .env file with test credentials...');
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Create a backup
    fs.writeFileSync(`${envFilePath}.backup.ethereal`, envContent);
    
    // Update the settings
    envContent = updateSetting(envContent, 'EMAIL_HOST', 'smtp.ethereal.email');
    envContent = updateSetting(envContent, 'EMAIL_PORT', '587');
    envContent = updateSetting(envContent, 'EMAIL_SECURE', 'false');
    envContent = updateSetting(envContent, 'EMAIL_USER', testAccount.user);
    envContent = updateSetting(envContent, 'EMAIL_PASSWORD', testAccount.pass);
    envContent = updateSetting(envContent, 'EMAIL_FROM', testAccount.user);
    
    fs.writeFileSync(envFilePath, envContent);
    
    // Test the credentials
    console.log('Testing connection with new credentials...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    await transporter.verify();
    console.log('Email connection verified successfully!');
    
    // Send a test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Test Email" <${testAccount.user}>`,
      to: testAccount.user, // sending to self for testing
      subject: 'Test Email for Venezuelan Raffle Website',
      text: 'This email confirms that your email service is working correctly with Ethereal.',
      html: '<b>This email confirms that your email service is working correctly with Ethereal.</b>'
    });
    
    console.log('Test email sent successfully!', info.messageId);
    console.log('\nSUCCESS! Your email system is now configured with Ethereal Email');
    console.log('\nIMPORTANT: This is a test service only. To view sent emails:');
    console.log('1. Go to: https://ethereal.email/login');
    console.log(`2. Username: ${testAccount.user}`);
    console.log(`3. Password: ${testAccount.pass}`);
    console.log('\nYou can preview the test email at:', nodemailer.getTestMessageUrl(info));
    
    return {
      success: true,
      user: testAccount.user,
      pass: testAccount.pass,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('Error setting up Ethereal Email:', error);
    return { success: false, error };
  }
}

// Run the setup
setupEtherealEmail()
  .then(result => {
    if (result.success) {
      console.log('\nRestart your backend server for changes to take effect');
    } else {
      console.log('Failed to set up Ethereal Email. Please check the error above.');
    }
  })
  .catch(err => console.error('Unexpected error:', err));
