require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const colors = require('colors');
const path = require('path');
const winston = require('winston');
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
      console.error(`Error de conexión MongoDB: ${err.message}`.red);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado - intentando reconectar...');
      console.log('MongoDB desconectado - intentando reconectar...'.yellow);
      
      // Attempt reconnection after a delay with exponential backoff
      setTimeout(() => {
        console.log('Intentando reconectar a MongoDB...'.yellow);
        connectDB().catch(err => console.error('Error en reconexión:', err.message));
      }, 5000);
    });

    return conn;
  } catch (error) {
    logger.error(`Error conectando a MongoDB: ${error.message}`);
    console.error(`Error conectando a MongoDB: ${error.message}`.red.bold);
    console.error('Asegúrate de que tu IP está en la lista blanca de MongoDB Atlas'.yellow);
    console.error('Visita: https://www.mongodb.com/docs/atlas/security-whitelist/'.blue);
    process.exit(1);
  }
};

// Production logging setup
if (process.env.NODE_ENV === 'production') {
  logger.info('Production logging initialized with file rotation', { service: 'raffle-website' });

  // Apply rate limiting in production
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Demasiadas solicitudes, por favor intente más tarde' },
  });
  
  logger.info('Applying rate limits to API endpoints', { service: 'raffle-website' });
  app.use('/api/', apiLimiter);
}

// Middleware
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// API Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/raffles', raffleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/test', testRoutes);

// Check for static files directory
const staticFilesPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(staticFilesPath)) {
  // Serve static files from React build
  app.use(express.static(staticFilesPath));
  
  // Serve React app for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticFilesPath, 'index.html'));
  });
  
  console.log(`🌐 Sirviendo archivos estáticos desde ${staticFilesPath}`.green);
} else {
  console.info("ℹ️  No static files to serve. Backend API mode only.");
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.message}`, { stack: err.stack });
  res.status(500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first
connectDB().then(() => {
  // Start the server only after DB connection is established
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor en ejecución en modo ${process.env.NODE_ENV} en puerto ${PORT}`.green.bold);
  });

  // Handle server shutdown
  const gracefulShutdown = () => {
    console.log('🛑 Cerrando servidor...'.yellow.bold);
    server.close(() => {
      console.log('✅ Servidor HTTP cerrado'.green);
      mongoose.connection.close(false, () => {
        console.log('✅ Conexión MongoDB cerrada'.green);
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}).catch(err => {
  console.error(`Error inicializando la aplicación: ${err.message}`.red.bold);
});
