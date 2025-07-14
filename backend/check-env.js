// Simple script to check if environment variables are loaded correctly
require('dotenv').config();

console.log('======================================');
console.log('ENVIRONMENT VARIABLES CHECK');
console.log('======================================');

// Check critical variables without showing full values
const envVars = {
  'MONGO_URI': process.env.MONGO_URI ? '✓ Set (starts with: ' + process.env.MONGO_URI.substring(0, 15) + '...)' : '✗ NOT SET',
  'PORT': process.env.PORT || '✗ NOT SET',
  'ADMIN_KEY': process.env.ADMIN_KEY ? '✓ Set (value: ' + process.env.ADMIN_KEY + ')' : '✗ NOT SET',
  'JWT_SECRET': process.env.JWT_SECRET ? '✓ Set (starts with: ' + process.env.JWT_SECRET.substring(0, 10) + '...)' : '✗ NOT SET',
  'NODE_ENV': process.env.NODE_ENV || 'not set (will use default)'
};

for (const [key, value] of Object.entries(envVars)) {
  console.log(`${key}: ${value}`);
}

console.log('======================================');
