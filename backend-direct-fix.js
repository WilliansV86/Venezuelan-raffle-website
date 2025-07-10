// Direct MongoDB connection test and backend server starter
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const mongoose = require('mongoose');

// Essential environment variables
const ENV_VARS = {
  MONGO_URI: 'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority',
  PORT: '5100',
  ADMIN_KEY: 'test-admin-key-123',
  NODE_ENV: 'development'
};

// Create .env file with the required variables
function createEnvFile() {
  console.log('Setting up .env file...');
  const envPath = path.join(__dirname, 'backend', '.env');
  let envContent = '';
  
  Object.entries(ENV_VARS).forEach(([key, value]) => {
    envContent += `${key}=${value}\n`;
  });
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
}

// Test MongoDB connection directly
async function testMongoConnection() {
  console.log('Testing MongoDB connection...');
  try {
    await mongoose.connect(ENV_VARS.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log(`Connected to database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    
    // List collections to verify database access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('Network error: Check your internet connection and IP whitelist in MongoDB Atlas');
    }
    return false;
  }
}

// Start backend server with proper environment
function startBackendServer() {
  console.log('Starting backend server...');
  
  // Make sure we're in the right directory
  const backendPath = path.join(__dirname, 'backend');
  
  // Define the startup command (node server.js)
  const nodeProcess = spawn('node', ['server.js'], {
    cwd: backendPath,
    env: { ...process.env, ...ENV_VARS },
    stdio: 'inherit' // Show output in the current console
  });
  
  nodeProcess.on('error', (err) => {
    console.error('Failed to start backend server:', err);
  });
  
  // When the process exits
  nodeProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Backend server process exited with code ${code}`);
    }
  });
}

// Main function to run the sequence
async function main() {
  console.log('===================================================');
  console.log('VENEZUELAN RAFFLE WEBSITE - DIRECT BACKEND FIX');
  console.log('===================================================');
  
  // Step 1: Create the .env file
  createEnvFile();
  
  // Step 2: Test MongoDB connection
  const connectionSuccess = await testMongoConnection();
  if (!connectionSuccess) {
    console.error('MongoDB connection test failed. Please check your network and credentials.');
    console.error('Attempting to start the server anyway...');
  }
  
  // Step 3: Start the backend server
  startBackendServer();
  
  console.log('===================================================');
  console.log('Backend server should now be starting on port 5100');
  console.log('To verify it\'s working, try: http://localhost:5100/api/ping');
  console.log('===================================================');
}

// Run the main function
main().catch(console.error);
