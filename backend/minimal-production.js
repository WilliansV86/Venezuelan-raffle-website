require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Routes imports (keep only if these already exist)
const ticketRoutes = require('./src/routes/ticketRoutes');
const raffleRoutes = require('./src/routes/raffleRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const testRoutes = require('./src/routes/testRoute');

// Create Express app
const app = express();

// Enable CORS for all origins during testing
app.use(cors());

// MONGODB CONNECTION WITH ROBUST RECONNECTION
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB Connection Error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('connected', () => {
  console.info('MongoDB connected successfully');
});

// Connect with retry logic
const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  });
};

const connectDB = async () => {
  try {
    await connectWithRetry();
    console.log(`MongoDB Connected`);
    return mongoose.connection;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check route that doesn't require DB connection
app.get('/api/health/ping', (req, res) => {
  res.json({ status: 'ok', message: 'pong' });
});

// Health check route that verifies MongoDB connection
app.get('/api/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({
      status: 'ok',
      mongodb: 'connected',
      server: 'online',
      time: new Date().toISOString(),
    });
  } else {
    res.status(500).json({
      status: 'error',
      mongodb: 'disconnected',
      server: 'online',
      time: new Date().toISOString(),
    });
  }
});

// Connect to MongoDB and then set up the routes
connectDB().then(() => {
  // Routes
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/raffles', raffleRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/test', testRoutes);
  
  console.log('All routes have been set up after MongoDB connected');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5001;

// Handle server shutdown
process.on('SIGTERM', () => {
  console.log('Received termination signal, shutting down server...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received interrupt signal, shutting down server...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

// Start the server
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  })
  .catch(err => {
    console.error(`Error initializing the application: ${err.message}`);
    process.exit(1);
  });
