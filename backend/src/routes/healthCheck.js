const express = require('express');
const router = express.Router();

// Simple route to check if server is running and has required environment variables
router.get('/', (req, res) => {
  const envCheck = {
    mongo_uri: !!process.env.MONGO_URI,
    jwt_secret: !!process.env.JWT_SECRET,
    admin_key: !!process.env.ADMIN_KEY,
    port: process.env.PORT || '5100'
  };
  
  res.json({
    status: 'ok',
    message: 'Server is running',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
