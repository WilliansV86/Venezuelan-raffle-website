// CORS-enabled server with debugging
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load routes
const raffleRoutes = require('./routes/raffleRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Create Express app
const app = express();

// CORS configuration with detailed logging
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
});

// Enable CORS for all routes - explicitly allow frontend origin
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// API Routes
app.use('/api/raffles', raffleRoutes);
app.use('/api/tickets', ticketRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 
      'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Print some database info
    const raffles = await mongoose.connection.db.collection('raffles').countDocuments();
    console.log(`Found ${raffles} raffles in database`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Connect to DB first, then start server
connectDB().then(() => {
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend can connect to: http://localhost:${PORT}/api/raffles`);
    console.log(`CORS enabled for: http://localhost:3000, http://127.0.0.1:3000`);
    console.log('Press Ctrl+C to stop the server');
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
