// Minimal version of main server to ensure basic functionality works
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Initialize express app
const app = express();

// Enhanced CORS settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI environment variable is not defined');
  process.exit(1);
}

// Basic schemas
const participantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  identificationNumber: String
});

const raffleSchema = new mongoose.Schema({
  title: String,
  description: String,
  ticketPrice: Number,
  startDate: Date,
  endDate: Date,
  drawDate: Date,
  isActive: Boolean,
  maxTickets: Number
});

// Register models
const Participant = mongoose.model('Participant', participantSchema);
const Raffle = mongoose.model('Raffle', raffleSchema);

// Connect to MongoDB with more verbose error handling
mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    startServer();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.error('This error usually means the server cannot be reached.');
      console.error('Please check that your IP is whitelisted in MongoDB Atlas.');
    }
    process.exit(1);
  });

function startServer() {
  // Simple health check
  app.get('/ping', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get active raffles - with debug info
  app.get('/api/raffles/active', async (req, res) => {
    try {
      console.log('GET /api/raffles/active requested');
      const raffles = await Raffle.find({ isActive: true });
      console.log(`Found ${raffles.length} active raffles`);
      res.json({ success: true, data: raffles });
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get all raffles
  app.get('/api/raffles', async (req, res) => {
    try {
      console.log('GET /api/raffles requested');
      const raffles = await Raffle.find();
      console.log(`Found ${raffles.length} raffles total`);
      res.json({ success: true, data: raffles });
    } catch (error) {
      console.error('Error fetching all raffles:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create test raffle endpoint
  app.get('/api/create-test-raffle', async (req, res) => {
    try {
      console.log('Creating test raffle...');
      const existingRaffles = await Raffle.find();
      
      if (existingRaffles.length === 0) {
        const testRaffle = new Raffle({
          title: 'Sorteo Motocicleta 2024',
          description: 'Gana una motocicleta de último modelo',
          ticketPrice: 5,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          drawDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), // 31 days from now
          isActive: true,
          maxTickets: 1000
        });
        
        await testRaffle.save();
        console.log('Test raffle created:', testRaffle.title);
        res.json({ success: true, message: 'Test raffle created', data: testRaffle });
      } else {
        console.log('Raffles already exist:', existingRaffles.length);
        res.json({ success: true, message: 'Raffles already exist', data: existingRaffles });
      }
    } catch (error) {
      console.error('Error creating test raffle:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Start server
  const PORT = process.env.PORT || 5100;
  app.listen(PORT, () => {
    console.log(`Main server running on port ${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/ping`);
    console.log(`Raffles endpoint: http://localhost:${PORT}/api/raffles`);
  });
}
