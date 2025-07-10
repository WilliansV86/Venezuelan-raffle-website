// Fixed raffle server with MongoDB connection and essential routes
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Initialize app
const app = express();

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
const PORT = process.env.PORT || 5100;

// Set CORS options
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Define the Raffle schema
const raffleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  ticketPrice: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  percentageSold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Raffle model
const Raffle = mongoose.model('Raffle', raffleSchema);

// Health check endpoints
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    server: 'online',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Raffle routes
app.get('/api/raffles', async (req, res) => {
  try {
    const raffles = await Raffle.find({});
    res.json({
      success: true,
      count: raffles.length,
      data: raffles
    });
  } catch (error) {
    console.error('Error fetching raffles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching raffles',
      error: error.message
    });
  }
});

// Active raffles endpoint
app.get('/api/raffles/active', async (req, res) => {
  try {
    const activeRaffles = await Raffle.find({ status: 'active' });
    res.json({
      success: true,
      count: activeRaffles.length,
      data: activeRaffles
    });
  } catch (error) {
    console.error('Error fetching active raffles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active raffles',
      error: error.message
    });
  }
});

// Past raffles endpoint
app.get('/api/raffles/past', async (req, res) => {
  try {
    const pastRaffles = await Raffle.find({ status: 'completed' });
    res.json({
      success: true,
      count: pastRaffles.length,
      data: pastRaffles
    });
  } catch (error) {
    console.error('Error fetching past raffles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching past raffles',
      error: error.message
    });
  }
});

// Create test raffle endpoint
app.get('/api/create-test-raffle', async (req, res) => {
  try {
    const testRaffle = new Raffle({
      title: 'Sorteo Motocicleta 2024',
      description: 'Gana una motocicleta de último modelo',
      image: '/images/motocicleta.jpg',
      ticketPrice: 5,
      status: 'active',
      percentageSold: 45
    });
    
    await testRaffle.save();
    
    res.json({
      success: true,
      message: 'Test raffle created successfully',
      data: testRaffle
    });
  } catch (error) {
    console.error('Error creating test raffle:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating test raffle',
      error: error.message
    });
  }
});

// Connect to MongoDB
async function connectMongoDB() {
  try {
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connection successful!');
    console.log(`Connected to database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    
    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/ping`);
      console.log(`Raffles endpoint: http://localhost:${PORT}/api/raffles`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('Attempting to start server without MongoDB...');
    
    // Start server even if DB connection fails
    app.listen(PORT, () => {
      console.log(`🚀 Server running without MongoDB on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/ping`);
    });
  }
}

// Start the server
connectMongoDB();
