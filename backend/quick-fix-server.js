// Quick fix server - avoids model duplication issues
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Initialize express
const app = express();

// MongoDB connection - using your existing connection string
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
const PORT = process.env.PORT || 5100;

// Set up CORS to allow frontend connections
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoints
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Create Raffle schema directly - avoid importing to prevent model conflicts
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

// Create the model
const Raffle = mongoose.model('Raffle', raffleSchema);

// Routes for raffle API
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

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Start the server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`Test the connection: http://localhost:${PORT}/api/ping`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Starting server without MongoDB...');
    
    // Start server even without DB connection
    app.listen(PORT, () => {
      console.log(`Backend server running WITHOUT MongoDB on port ${PORT}`);
    });
  });
