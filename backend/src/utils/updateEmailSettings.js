/**
 * This script updates the email settings in .env file
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '../../.env');

try {
  console.log('Reading .env file...');
  let envFileContent = fs.readFileSync(envFilePath, 'utf8');
  
  // Make a backup of the current .env file
  fs.writeFileSync(`${envFilePath}.backup`, envFileContent);
  console.log('Created backup at .env.backup');
  
  // Update the email settings
  console.log('Updating email settings...');
  
  // Function to update or add a setting
  const updateSetting = (content, key, value) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    } else {
      return `${content}\n${key}=${value}`;
    }
  };
  
  // Update EMAIL_PORT and EMAIL_SECURE
  envFileContent = updateSetting(envFileContent, 'EMAIL_PORT', '465');
  envFileContent = updateSetting(envFileContent, 'EMAIL_SECURE', 'true');
  
  // Write the updated content back to .env file
  fs.writeFileSync(envFilePath, envFileContent);
  console.log('Email settings updated successfully!');
  console.log('New settings:');
  console.log('EMAIL_PORT=465');
  console.log('EMAIL_SECURE=true');
  
  console.log('\nPlease restart your backend server for changes to take effect.');
} catch (error) {
  console.error('Error updating .env file:', error);
}
