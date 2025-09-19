// Simple script to check if environment variables are loaded correctly
require('dotenv').config();

console.log('======================================');
console.log('ENVIRONMENT VARIABLES CHECK');
console.log('======================================');

// Check critical variables without showing full values
const envVars = {
  'MONGO_URI': process.env.MONGO_URI ? '✓ Set' : '✗ NOT SET',
  'PORT': process.env.PORT || '✗ NOT SET',
  'ADMIN_KEY': process.env.ADMIN_KEY ? '✓ Set' : '✗ NOT SET',
  'JWT_SECRET': process.env.JWT_SECRET ? '✓ Set' : '✗ NOT SET',
  'CLOUDINARY_CLOUD_NAME': process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ NOT SET',
  'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ NOT SET',
  'CLOUDINARY_API_SECRET': process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ NOT SET',
  'EMAIL_HOST': process.env.EMAIL_HOST ? '✓ Set' : '✗ NOT SET',
  'EMAIL_PORT': process.env.EMAIL_PORT ? '✓ Set' : '✗ NOT SET',
  'EMAIL_USER': process.env.EMAIL_USER ? '✓ Set' : '✗ NOT SET',
  'EMAIL_PASS': process.env.EMAIL_PASS ? '✓ Set' : '✗ NOT SET',
  'NODE_ENV': process.env.NODE_ENV || 'not set (will use default)'
};

for (const [key, value] of Object.entries(envVars)) {
  console.log(`${key}: ${value}`);
}

console.log('======================================');
