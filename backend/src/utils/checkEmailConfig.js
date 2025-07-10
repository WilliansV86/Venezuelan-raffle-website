/**
 * Utility module to check email configuration
 * Can be imported and used in server.js or run directly with: node src/utils/checkEmailConfig.js
 */

if (require.main === module) {
  require('dotenv').config();
  const result = checkEmailConfig();
  
  if (!result.success) {
    console.error('\nTo fix these issues, update your .env file with the missing variables.');
  }
  
  console.log('\nTo test the email functionality, purchase a ticket through the frontend.');
}

/**
 * Checks if all required email configuration variables are present
 * @returns {Object} Result object with success status and missing variables
 */
function checkEmailConfig() {
  console.log('Checking email configuration...');

  // Check required email variables
  const requiredVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
    'ADMIN_EMAIL'
  ];

  let missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    return { success: false, missingVars };
  } else {
    console.log('✅ All required email environment variables are set!');
    console.log('\nConfiguration summary (values partially hidden for security):');
    console.log(`- EMAIL_HOST: ${process.env.EMAIL_HOST}`);
    console.log(`- EMAIL_PORT: ${process.env.EMAIL_PORT}`);
    
    try {
      // Handle potential undefined values safely
      if (process.env.EMAIL_USER) {
        console.log(`- EMAIL_USER: ${process.env.EMAIL_USER.substring(0, 3)}...${process.env.EMAIL_USER.split('@')[1] || ''}`); 
      }
      
      console.log(`- EMAIL_PASSWORD: ${'*'.repeat(10)}`);
      
      if (process.env.EMAIL_FROM) {
        console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM.substring(0, 3)}...${process.env.EMAIL_FROM.split('@')[1] || ''}`);
      }
      
      if (process.env.ADMIN_EMAIL) {
        console.log(`- ADMIN_EMAIL: ${process.env.ADMIN_EMAIL.substring(0, 3)}...${process.env.ADMIN_EMAIL.split('@')[1] || ''}`);
      }
    } catch (error) {
      console.warn('Warning: Error formatting email configuration display');
    }
    
    if (process.env.EMAIL_FROM_NAME) {
      console.log(`- EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME}`);
    } else {
      console.log('- EMAIL_FROM_NAME: Not set (will default to "Sorteo Venezolano")');
    }
    
    return { success: true };
  }
}

module.exports = checkEmailConfig;
