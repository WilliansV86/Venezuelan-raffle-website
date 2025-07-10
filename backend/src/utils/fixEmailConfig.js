/**
 * Email Configuration Diagnostic and Fix Tool
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { testEmailConfig } = require('./emailService');

const envFilePath = path.join(__dirname, '../../.env');
const GMAIL_SPECIFIC_SETTINGS = {
  host: 'smtp.gmail.com',
  port: '465',
  secure: 'true'
};

/**
 * Create an interface for user input
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Read the current .env file content
 */
const readEnvFile = () => {
  try {
    return fs.readFileSync(envFilePath, 'utf8');
  } catch (error) {
    console.error('Error reading .env file:', error);
    return null;
  }
};

/**
 * Update or add a setting in the .env file
 */
const updateSetting = (content, key, value) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return `${content}\n${key}=${value}`;
  }
};

/**
 * Save the updated content to the .env file
 */
const saveEnvFile = (content) => {
  try {
    // Create a backup first
    fs.writeFileSync(`${envFilePath}.backup.${Date.now()}`, readEnvFile());
    fs.writeFileSync(envFilePath, content);
    return true;
  } catch (error) {
    console.error('Error saving .env file:', error);
    return false;
  }
};

/**
 * Test Gmail SMTP connection with the current settings
 */
const testConnection = async () => {
  console.log('\n🔍 Testing current email configuration...');
  
  try {
    const result = await testEmailConfig();
    if (result.success) {
      console.log('✅ Email configuration test PASSED! Your email settings are working correctly.');
      return true;
    } else {
      console.log(`❌ Email configuration test FAILED: ${result.message}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Email configuration test failed with an error:', error);
    return false;
  }
};

/**
 * Send a test email
 */
const sendTestEmail = async (recipient) => {
  console.log(`\n📧 Sending test email to ${recipient}...`);
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true
    });
    
    // Verify connection first
    await transporter.verify();
    
    // Send test email
    const result = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Email Test'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: recipient,
      subject: 'Test Email - Venezuelan Raffle Website',
      text: 'This is a test email to verify the email sending functionality is working.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #0284c7;">Email Configuration Test</h2>
          <p>This is a test email to verify the email sending functionality is working.</p>
          <p>If you received this email, your email configuration is working correctly!</p>
          <p>You can now use the email notification system for ticket purchases.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">— Venezuelan Raffle Website</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    return false;
  }
};

/**
 * Apply Gmail-specific settings
 */
const applyGmailSettings = () => {
  console.log('\n🔧 Applying Gmail-specific settings...');
  let envContent = readEnvFile();
  
  if (!envContent) return false;
  
  Object.entries(GMAIL_SPECIFIC_SETTINGS).forEach(([key, value]) => {
    envContent = updateSetting(envContent, `EMAIL_${key.toUpperCase()}`, value);
  });
  
  if (saveEnvFile(envContent)) {
    console.log('✅ Gmail settings applied successfully!');
    console.log('Updated settings:');
    Object.entries(GMAIL_SPECIFIC_SETTINGS).forEach(([key, value]) => {
      console.log(`- EMAIL_${key.toUpperCase()}=${value}`);
    });
    return true;
  }
  
  return false;
};

/**
 * Display current email settings
 */
const displayCurrentSettings = () => {
  console.log('\n📊 Current Email Settings:');
  console.log(`- EMAIL_HOST: ${process.env.EMAIL_HOST || 'Not set'}`);
  console.log(`- EMAIL_PORT: ${process.env.EMAIL_PORT || 'Not set'}`);
  console.log(`- EMAIL_SECURE: ${process.env.EMAIL_SECURE || 'Not set'}`);
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER ? (process.env.EMAIL_USER.substring(0, 3) + '...') : 'Not set'}`);
  console.log(`- EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '*********' : 'Not set'}`);
  console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`- EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || 'Not set'}`);
  console.log(`- ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'Not set'}`);
};

/**
 * Main function
 */
const main = async () => {
  console.log('==================================================');
  console.log('📧 Venezuelan Raffle Website - Email Configuration Diagnostic');
  console.log('==================================================');
  
  // Display current settings
  displayCurrentSettings();
  
  // Test current configuration
  const isWorking = await testConnection();
  
  if (isWorking) {
    console.log('\n🎉 Your email configuration is working correctly!');
    
    // Offer to send a test email
    rl.question('\nWould you like to send a test email? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        rl.question('Enter the recipient email address: ', async (email) => {
          await sendTestEmail(email);
          console.log('\n🏁 Email diagnostic complete! Your email configuration is working correctly.');
          rl.close();
        });
      } else {
        console.log('\n🏁 Email diagnostic complete! Your email configuration is working correctly.');
        rl.close();
      }
    });
  } else {
    console.log('\n🔄 Your email configuration is not working. Let\'s try to fix it.');
    
    if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
      console.log('\n👉 Gmail detected. Here are some common issues and solutions:');
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('2. Gmail often works better with these settings: port 465 and secure=true');
      
      rl.question('\nWould you like to apply recommended Gmail settings? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          applyGmailSettings();
          console.log('\n🔄 Testing with new settings...');
          const fixedWithSettings = await testConnection();
          
          if (fixedWithSettings) {
            console.log('\n🎉 Success! Your email configuration is now working correctly.');
            rl.close();
          } else {
            console.log('\n❌ Settings change didn\'t resolve the issue.');
            offerAdditionalHelp();
          }
        } else {
          offerAdditionalHelp();
        }
      });
    } else {
      offerAdditionalHelp();
    }
  }
};

/**
 * Offer additional help for persistent issues
 */
const offerAdditionalHelp = () => {
  console.log('\n👉 Here are some suggestions to fix email issues:');
  console.log('1. Check if your email provider allows SMTP access');
  console.log('2. For Gmail, make sure you have:');
  console.log('   - Created an App Password (not your regular password)');
  console.log('   - Enabled "Less secure app access" in your Google Account');
  console.log('3. Try using a different email provider like Outlook or a test service like Ethereal Email');
  
  rl.question('\nWould you like to try using Ethereal (fake SMTP service for testing)? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      await setupEtherealEmail();
    } else {
      console.log('\n🏁 Email diagnostic complete. Please check the suggestions above to resolve your email issues.');
      rl.close();
    }
  });
};

/**
 * Set up Ethereal Email for testing
 */
const setupEtherealEmail = async () => {
  console.log('\n🔧 Setting up Ethereal Email (fake SMTP service)...');
  
  try {
    // Create Ethereal account
    const testAccount = await nodemailer.createTestAccount();
    console.log('✅ Ethereal Email account created successfully!');
    
    // Update .env file with Ethereal credentials
    let envContent = readEnvFile();
    envContent = updateSetting(envContent, 'EMAIL_HOST', 'smtp.ethereal.email');
    envContent = updateSetting(envContent, 'EMAIL_PORT', '587');
    envContent = updateSetting(envContent, 'EMAIL_SECURE', 'false');
    envContent = updateSetting(envContent, 'EMAIL_USER', testAccount.user);
    envContent = updateSetting(envContent, 'EMAIL_PASSWORD', testAccount.pass);
    envContent = updateSetting(envContent, 'EMAIL_FROM', testAccount.user);
    
    if (saveEnvFile(envContent)) {
      console.log('✅ Ethereal Email credentials saved to .env file!');
      console.log('\n📊 New Email Settings:');
      console.log(`- EMAIL_HOST: smtp.ethereal.email`);
      console.log(`- EMAIL_PORT: 587`);
      console.log(`- EMAIL_SECURE: false`);
      console.log(`- EMAIL_USER: ${testAccount.user}`);
      console.log(`- EMAIL_PASSWORD: ${testAccount.pass}`);
      
      // Test the new configuration
      console.log('\n🔄 Testing with Ethereal Email settings...');
      await testConnection();
      
      console.log('\n👉 IMPORTANT: Ethereal Email is for testing only!');
      console.log('You can view sent emails at:');
      console.log(`https://ethereal.email/login`);
      console.log(`Username: ${testAccount.user}`);
      console.log(`Password: ${testAccount.pass}`);
      
      rl.question('\nWould you like to send a test email with Ethereal? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          // Send test email with Ethereal
          const result = await sendTestEmail(testAccount.user);
          if (result) {
            console.log(`\n👉 View the test email at: https://ethereal.email/login`);
            console.log(`Username: ${testAccount.user}`);
            console.log(`Password: ${testAccount.pass}`);
          }
        }
        
        console.log('\n🏁 Email diagnostic complete! You now have a working test email setup.');
        console.log('NOTE: For production, you\'ll need to switch back to a real email provider.');
        rl.close();
      });
      
    } else {
      console.error('❌ Failed to save Ethereal Email credentials to .env file.');
      rl.close();
    }
  } catch (error) {
    console.error('❌ Failed to set up Ethereal Email:', error);
    rl.close();
  }
};

// Run the main function
main();
