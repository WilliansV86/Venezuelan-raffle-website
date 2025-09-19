console.log('--- Starting .env file test ---');

try {
  require('dotenv').config();
  console.log('.env file loaded successfully.');
  console.log('--- Environment Variables ---');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  // Do not log the password for security reasons
  console.log('EMAIL_PASS is', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  console.log('---------------------------');
} catch (error) {
  console.error('A critical error occurred while loading the .env file:');
  console.error(error);
}
