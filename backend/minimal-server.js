// Minimal server with just essential functionality
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins during testing
app.use(cors());

// Middleware
app.use(express.json());

// Simple health check route
app.get('/api/health/ping', (req, res) => {
  res.json({ status: 'ok', message: 'pong' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'online',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test route for purchase
app.post('/api/tickets/purchase', (req, res) => {
  try {
    // Just echo back the request for testing
    res.json({
      success: true,
      message: 'Test purchase received successfully',
      data: {
        requestReceived: req.body,
        ticketPrice: 1.5,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Minimal test server running on port ${PORT}`);
});
