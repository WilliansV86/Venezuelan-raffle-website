require('dotenv').config();
const { cloudinary, uploadToCloudinary } = require('./cloudinaryConfig');
const fs = require('fs');
const path = require('path');

/**
 * Test Cloudinary connection and configuration
 */
async function testCloudinaryConnection() {
  console.log('Testing Cloudinary connection...');
  
  try {
    // First, check if environment variables are set
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables.');
      console.error('Please check your .env file and ensure all Cloudinary variables are set:');
      console.error('- CLOUDINARY_CLOUD_NAME');
      console.error('- CLOUDINARY_API_KEY');
      console.error('- CLOUDINARY_API_SECRET');
      process.exit(1);
    }
    
    // Test API connection with a simple ping
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary API connection successful!');
    
    // Display account info
    console.log('Retrieving account information...');
    const account = await cloudinary.api.account_info();
    console.log(`Account name: ${account.account.name}`);
    console.log(`Plan: ${account.account.plan}`);
    console.log(`Usage: ${account.usage.credits.used}/${account.usage.credits.limit} credits`);
    
    console.log('Cloudinary configuration is valid and working properly!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cloudinary connection failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testCloudinaryConnection();
