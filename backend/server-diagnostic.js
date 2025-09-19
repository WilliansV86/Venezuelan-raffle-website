// Simple diagnostic script to test the backend server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend server is working correctly',
    time: new Date().toISOString()
  });
});

// Test route for raffles
app.get('/api/raffles/test', async (req, res) => {
  try {
    // Check if we can connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
    // Return success
    res.json({
      success: true,
      message: 'Database connection is working',
      mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error connecting to database',
      error: error.message
    });
  }
});

// Start the server
const PORT = 5200; // Use a different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`Diagnostic server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Database test endpoint: http://localhost:${PORT}/api/raffles/test`);
});
