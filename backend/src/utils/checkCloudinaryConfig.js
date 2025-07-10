/**
 * Utility module to check Cloudinary configuration
 */

if (require.main === module) {
  require('dotenv').config();
  const result = checkCloudinaryConfig();
  
  if (!result.success) {
    console.error('\nTo fix these issues, update your .env file with the missing Cloudinary variables.');
  }
}

/**
 * Checks if all required Cloudinary configuration variables are present
 * @returns {Object} Result object with success status and missing variables
 */
function checkCloudinaryConfig() {
  console.log('Checking Cloudinary configuration...');

  // Check required Cloudinary variables
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  let missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required Cloudinary environment variables:');
    missingVars.forEach(varName => console.error(`  - ${varName}`));
    return { success: false, missingVars };
  } else {
    console.log('✅ All required Cloudinary environment variables are set!');
    console.log('\nConfiguration summary (values partially hidden for security):');
    console.log(`- CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`- CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 4) + '...' : 'Not set'}`);
    console.log(`- CLOUDINARY_API_SECRET: ${'*'.repeat(10)}`);
    
    return { success: true };
  }
}

module.exports = checkCloudinaryConfig;
