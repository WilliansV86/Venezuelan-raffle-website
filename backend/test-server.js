// Simple test file to check if the server can start
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Environment variables loaded successfully');

// Try to import the modules
try {
  const express = require('express');
  console.log('Express imported successfully');
  
  const connectDB = require('./src/config/db.js');
  console.log('DB connection module imported successfully');
  
  // Try to import the routes
  const healthCheckRoutes = require('./src/routes/healthCheck.js');
  console.log('Health check routes imported successfully');
  
  const raffleRoutes = require('./src/routes/raffleRoutes.js');
  console.log('Raffle routes imported successfully');
  
  const adminRoutes = require('./src/routes/adminRoutes.js');
  console.log('Admin routes imported successfully');
  
  console.log('All modules imported successfully. Server should be able to start.');
} catch (error) {
  console.error('Error importing modules:');
  console.error(error);
}
