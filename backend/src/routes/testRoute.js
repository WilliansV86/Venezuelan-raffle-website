const express = require('express');
const router = express.Router();

// Simple test endpoint
router.get('/ping', (req, res) => {
  res.json({ message: 'Test endpoint is working!' });
});

// Test POST endpoint
router.post('/test-post', (req, res) => {
  console.log('Received test POST request');
  console.log('Request body:', req.body);
  res.json({ 
    status: 'success', 
    message: 'Test POST successful',
    received: req.body 
  });
});

module.exports = router;
