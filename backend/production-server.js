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

// Connect to MongoDB - IMPROVED CONNECTION
const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definido en el archivo .env');
    }

    // Connect to MongoDB with improved options
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      family: 4,
      maxPoolSize: 10,
    };
    
    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
    logger.info(`MongoDB Conectado: ${conn.connection.host}`);
    console.log(`MongoDB Conectado: ${conn.connection.host}`.cyan.underline);
    
    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error(`Error de conexión MongoDB: ${err.message}`);
      console.error(`Error de conexión MongoDB: ${err.message}`.red.bold);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado - intentando reconectar...');
      console.log('MongoDB desconectado - intentando reconectar...');
      
      // Attempt reconnection after a delay
      setTimeout(() => {
        console.log('Intentando reconectar a MongoDB...');
        connectDB().catch(err => console.error('Error en reconexión:', err.message));
      }, 5000);
    });

    return conn;
  } catch (error) {
    logger.error(`Error conectando a MongoDB: ${error.message}`);
    console.error(`Error conectando a MongoDB: ${error.message}`.red.bold);
    console.error('Asegúrate de que tu IP está en la lista blanca de MongoDB Atlas');
    console.error('Visita: https://www.mongodb.com/docs/atlas/security-whitelist/');
    return null;
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

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/test', testRoutes);

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

// Start server once MongoDB is connected
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT} en modo ${process.env.NODE_ENV}`.yellow.bold);
    logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`, { service: 'raffle-website' });
  });

  // Handling unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`.red.bold);
    logger.error(`Unhandled Promise Rejection: ${err.message}`, { service: 'raffle-website' });
    // Close server & exit process
    server.close(() => process.exit(1));
  });

}).catch(err => {
  console.error(`Error inicializando la aplicación: ${err.message}`.red.bold);
  process.exit(1);
});
