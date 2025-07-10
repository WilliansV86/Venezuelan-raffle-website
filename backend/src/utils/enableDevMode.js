/**
 * Enable Development Mode for Email
 * This sets up a development mode where emails are logged but not sent
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../../.env');
const logDir = path.join(__dirname, '../../logs');
const emailLogPath = path.join(logDir, 'email_logs.json');

// Function to update or add a setting in .env file
const updateSetting = (content, key, value) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return `${content}\n${key}=${value}`;
  }
};

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create empty email logs file if it doesn't exist
if (!fs.existsSync(emailLogPath)) {
  fs.writeFileSync(emailLogPath, JSON.stringify([], null, 2));
}

try {
  console.log('Setting up Development Mode for Email...');
  
  // Read current .env content
  let envContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Create a backup
  fs.writeFileSync(`${envFilePath}.backup.devmode`, envContent);
  
  // Add EMAIL_DEV_MODE=true
  envContent = updateSetting(envContent, 'EMAIL_DEV_MODE', 'true');
  
  // Write the updated .env file
  fs.writeFileSync(envFilePath, envContent);
  
  console.log('Development Mode enabled successfully!');
  console.log('In this mode:');
  console.log('- Email sending will be simulated but not actually sent');
  console.log('- Email content will be logged to logs/email_logs.json');
  console.log('- Ticket purchases will work normally');
  
} catch (error) {
  console.error('Error setting up Development Mode:', error);
}
