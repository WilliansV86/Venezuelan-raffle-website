// Script to create .env file with required variables
const fs = require('fs');
const path = require('path');

const envContent = `MONGO_URI=mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority
PORT=5100
ADMIN_PORT=5200
ADMIN_KEY=test-admin-key-123
EMAIL_FROM=example@example.com
ADMIN_EMAIL=admin@example.com
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Successfully created .env file with the following variables:');
  console.log('- MONGO_URI');
  console.log('- PORT=5100');
  console.log('- ADMIN_PORT=5200');
  console.log('- ADMIN_KEY');
  console.log('- EMAIL_FROM');
  console.log('- ADMIN_EMAIL');
} catch (err) {
  console.error('❌ Error creating .env file:', err);
}
