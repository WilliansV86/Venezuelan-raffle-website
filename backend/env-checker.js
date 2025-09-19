// Simple script to check what environment variables are loaded
require('dotenv').config();

console.log('Checking environment variables:');
console.log('===================================');
console.log('ADMIN_KEY:', process.env.ADMIN_KEY);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[PRESENT]' : '[MISSING]');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? '[PRESENT]' : '[MISSING]');
console.log('===================================');
