require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const colors = require('colors');
const path = require('path');
const logger = require('./src/utils/logger');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// Routes imports
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
  logger.error(`MongoDB Connection Error: ${err}`);
  console.error(`MongoDB Connection Error: ${err}`.red.bold);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
  console.warn('MongoDB disconnected. Attempting to reconnect...'.yellow);
});

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
  console.info('MongoDB connected successfully'.green);
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
    console.log(`MongoDB Connected`.cyan.underline);
    return mongoose.connection;
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Production logging setup
if (process.env.NODE_ENV === 'production') {
  logger.info('Production logging initialized with file rotation', { service: 'raffle-website' });
}

// Rate limiting middleware
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many health check requests from this IP, please try again after a minute'
});

// Apply rate limiting to API routes
app.use('/api/', standardLimiter);
app.use('/api/health', healthCheckLimiter);

logger.info('Applying rate limits to API endpoints', { service: 'raffle-website' });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check route that doesn't require DB connection
app.get('/api/health/ping', (req, res) => {
  res.json({ status: 'ok', message: 'pong' });
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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const frontendPath = path.resolve(__dirname, '../frontend/build');
  
  // Check if frontend build exists
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(frontendPath, 'index.html'));
    });
  } else {
    console.log('ℹ️  No static files to serve. Backend API mode only.');
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`.red);
  logger.error(`Error: ${err.message}`, { service: 'raffle-website' });
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5001;

// Handle server shutdown
const gracefulShutdown = () => {
  console.log('Recibida señal de terminación, cerrando servidor...');
  mongoose.connection.close(false, () => {
    console.log('Conexión MongoDB cerrada.');
    process.exit(0);
  });
  
  // Force exit after 10 seconds if MongoDB connection can't be closed
  setTimeout(() => {
    console.error('No se pudo cerrar la conexión MongoDB, forzando salida...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT} en modo ${process.env.NODE_ENV || 'development'}`.yellow.bold);
  logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`, { service: 'raffle-website' });
});

// Handling unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`.red.bold);
  logger.error(`Unhandled Promise Rejection: ${err.message}`, { service: 'raffle-website' });
  // We don't close the server here to allow for recovery
});
