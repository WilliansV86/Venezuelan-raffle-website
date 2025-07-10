// Test file to directly connect to MongoDB and check raffles
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URI set:', process.env.MONGO_URI ? 'Yes' : 'No');

// Define schemas and models here to avoid model registration issues
const raffleSchema = new mongoose.Schema({}, { strict: false });
const Raffle = mongoose.model('Raffle', raffleSchema, 'raffles');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, options)
  .then(() => {
    console.log('✅ MongoDB Connected successfully!');
    
    // Set up routes AFTER successful connection
    
    // Test route to verify server is running
    app.get('/', (req, res) => {
      res.json({ message: 'API is running' });
    });
    
    // Get active raffles route
    app.get('/api/raffles/active', async (req, res) => {
      try {
        console.log('GET /api/raffles/active - Looking for active raffles');
        
        const raffles = await Raffle.find({ 
          status: 'active',
          isActive: true,
          endDate: { $gte: new Date() }
        }).sort({ endDate: 1 });
        
        console.log(`Found ${raffles.length} active raffles`);
        
        res.json({
          success: true,
          count: raffles.length,
          data: raffles
        });
      } catch (error) {
        console.error('Error in /api/raffles/active:', error);
        res.status(500).json({ 
          success: false, 
          message: error.message,
          stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
      }
    });
    
    // Get all raffles route
    app.get('/api/raffles', async (req, res) => {
      try {
        console.log('GET /api/raffles - Looking for all raffles');
        const raffles = await Raffle.find().sort({ createdAt: -1 });
        
        console.log(`Found ${raffles.length} raffles total`);
        
        res.json({
          success: true,
          count: raffles.length,
          data: raffles
        });
      } catch (error) {
        console.error('Error in /api/raffles:', error);
        res.status(500).json({ 
          success: false, 
          message: error.message,
          stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
      }
    });
    
    // Start server
    const PORT = 5100; // Using a different port to avoid conflicts
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      console.log('Try accessing:');
      console.log(`- http://localhost:${PORT}/api/raffles/active`);
      console.log(`- http://localhost:${PORT}/api/raffles`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('ENOTFOUND')) {
      console.error('Could not find the MongoDB server. Check your URI.');
    } else if (err.message.includes('Authentication failed')) {
      console.error('MongoDB authentication failed. Check your username and password.');
    } else if (err.message.includes('ETIMEDOUT')) {
      console.error('Connection timed out. Your IP may not be whitelisted in MongoDB Atlas.');
    }
    process.exit(1);
  });
