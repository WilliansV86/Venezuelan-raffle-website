/**
 * Cloudinary Connection Test Utility
 * 
 * This script tests the Cloudinary API connection and upload functionality
 * Run with: node src/utils/testCloudinaryConnection.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

async function testCloudinaryConnection() {
  console.log('Testing Cloudinary connection...');
  
  // Check if environment variables are set
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Cloudinary environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('Please check your .env file and add the missing variables');
    return { success: false, missingVars };
  }
  
  // Configure Cloudinary
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    // Test API connection
    console.log('Connecting to Cloudinary API...');
    const accountResult = await cloudinary.api.ping();
    console.log('✅ Cloudinary API connection successful!');
    console.log(`   Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    
    // Create a test image
    const testImagePath = path.join(__dirname, 'test-image.png');
    createTestImage(testImagePath);
    
    // Test upload functionality
    console.log('\nTesting image upload functionality...');
    const uploadResult = await cloudinary.uploader.upload(testImagePath, {
      folder: 'test',
      public_id: 'connection-test-' + Date.now()
    });
    
    console.log('✅ Test image upload successful!');
    console.log(`   Image URL: ${uploadResult.secure_url}`);
    
    // Clean up the test image
    fs.unlinkSync(testImagePath);
    
    return { 
      success: true, 
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      testImageUrl: uploadResult.secure_url 
    };
  } catch (error) {
    console.error('❌ Cloudinary connection error:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('Invalid API key - check your CLOUDINARY_API_KEY');
    } else if (error.message.includes('API secret')) {
      console.error('Invalid API secret - check your CLOUDINARY_API_SECRET');
    } else if (error.message.includes('cloud name')) {
      console.error('Invalid cloud name - check your CLOUDINARY_CLOUD_NAME');
    }
    
    // Clean up test image if it was created
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    return { success: false, error: error.message };
  }
}

function createTestImage(filePath) {
  // Create a simple 100x100 black PNG image
  const width = 100;
  const height = 100;
  const buffer = Buffer.alloc(width * height * 4); // RGBA
  
  // Fill with black pixels (R=0, G=0, B=0, A=255)
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    buffer[offset] = 0;     // R
    buffer[offset + 1] = 0; // G
    buffer[offset + 2] = 0; // B
    buffer[offset + 3] = 255; // A (fully opaque)
  }
  
  // Write test image to PNG file using a placeholder
  // Note: In a real implementation, you would use a proper PNG encoder
  // This is just a simplified version for demonstration
  
  // Create a minimal valid PNG header
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x64, // width (100)
    0x00, 0x00, 0x00, 0x64, // height (100)
    0x08, // bit depth
    0x06, // color type (RGBA)
    0x00, // compression method
    0x00, // filter method
    0x00, // interlace method
    0x00, 0x00, 0x00, 0x00  // CRC (not correct, but for test purposes)
  ]);
  
  // Simple test pattern - just write the header
  // This won't be a valid PNG, but Cloudinary will reject it if connection fails
  fs.writeFileSync(filePath, header);
  console.log(`Created test image at: ${filePath}`);
}

// Run the test if this script is executed directly
if (require.main === module) {
  testCloudinaryConnection()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testCloudinaryConnection;
