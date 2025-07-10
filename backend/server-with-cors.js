const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { errorHandler } = require('./src/middleware/errorMiddleware');
const logger = require('./src/utils/logger');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration - ALLOW ALL ORIGINS FOR TESTING
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes
app.use('/api/tickets', require('./src/routes/ticketRoutes'));
app.use('/api/raffles', require('./src/routes/raffleRoutes'));
app.use('/api/health', require('./src/routes/healthRoutes'));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Venezuelan Raffle API' });
});

// Error handler middleware
app.use(errorHandler);

// Set port
const PORT = process.env.PORT || 5001;

// Connect to database
connectDB().then(() => {
  // Start server
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
  });
});
