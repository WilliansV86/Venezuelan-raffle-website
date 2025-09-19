require('dotenv').config();
const crypto = require('crypto');

// Function to detect special characters or whitespace
function analyzeString(str) {
  console.log('================================');
  console.log('ADMIN KEY DETAILED ANALYSIS');
  console.log('================================');
  
  if (!str) {
    console.log('ERROR: The string is empty or undefined');
    return;
  }
  
  console.log(`Raw value: "${str}"`);
  console.log(`Length: ${str.length} characters`);
  
  // Show character codes
  console.log('\nCharacter codes:');
  const codes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = str.charCodeAt(i);
    codes.push(`${char}:${code}`);
  }
  console.log(codes.join(', '));
  
  // Check for leading/trailing whitespace
  if (str !== str.trim()) {
    console.log('\nWARNING: String contains leading or trailing whitespace!');
    console.log(`Trimmed value: "${str.trim()}" (length: ${str.trim().length})`);
  }
  
  // Create a hash for comparison
  const hash = crypto.createHash('md5').update(str).digest('hex');
  console.log(`\nMD5 Hash (for comparison): ${hash}`);
  
  console.log('\nTest comparison:');
  const testStrings = [
    'Tusuerte2025',
    'tusuerte2025',
    'TUSUERTE2025',
    ' Tusuerte2025',
    'Tusuerte2025 '
  ];
  
  testStrings.forEach(test => {
    console.log(`"${test}" === "${str}": ${test === str}`);
  });
  
  console.log('================================');
}

// Print the environment variables
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET starts with:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '...' : 'undefined');

// Analyze the ADMIN_KEY
analyzeString(process.env.ADMIN_KEY);

// Test adminKey comparison
const adminKey = 'Tusuerte2025';
if (adminKey === process.env.ADMIN_KEY) {
  console.log('✅ TEST PASSED: The hardcoded adminKey matches the environment variable');
} else {
  console.log('❌ TEST FAILED: The hardcoded adminKey does NOT match the environment variable');
  console.log(`Hardcoded: "${adminKey}" (${adminKey.length} chars)`);
  console.log(`Environment: "${process.env.ADMIN_KEY}" (${process.env.ADMIN_KEY.length} chars)`);
}
