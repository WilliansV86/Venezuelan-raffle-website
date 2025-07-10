require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB, isConnected, waitForConnection, connection } = require('./config/db');
const mongoose = connection; // For backward compatibility
const checkEmailConfig = require('./src/utils/checkEmailConfig');
const checkCloudinaryConfig = require('./src/utils/checkCloudinaryConfig');
const checkMongoDbConnection = require('./src/utils/checkMongoDbConnection');
const path = require('path');
const logger = require('./src/utils/logger');
const { standardLimiter, healthCheckLimiter } = require('./src/middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Set mongoose options
mongoose.set('strictQuery', false);

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000', // Frontend development
  'http://localhost:5000', // Backend itself
  // Production domains
  'https://sorteovenezolano.com',
  'https://www.sorteovenezolano.com',
  // Add any additional production domains here
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route
app.get('/', (req, res) => {
  res.send('API para el Sorteo Venezolano está funcionando! 🇻🇪');
});

// API Routes
// Health check routes with specialized limiter
app.use('/api/health', healthCheckLimiter, require('./src/routes/healthRoutes'));

// Apply standard rate limiting to all other API routes in production
if (process.env.NODE_ENV === 'production') {
  logger.info('Applying rate limits to API endpoints');
  app.use('/api', standardLimiter);
}

app.use('/api/raffles', require('./src/routes/raffleRoutes'));
app.use('/api/tickets', require('./src/routes/ticketRoutes'));
app.use('/api/participants', require('./src/routes/participantRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/admin/monitor', require('./src/routes/adminMonitoringRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes')); // Add the admin routes

// Error Handling Middleware
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server; // For graceful shutdown

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the 'public' directory if it exists
  const publicPath = path.join(__dirname, 'public');
  const fs = require('fs');
  
  if (fs.existsSync(publicPath)) {
    console.log('✅ Serving static files from:', publicPath);
    app.use(express.static(publicPath));
    
    // The "catchall" handler for any request that doesn't match one of our routes
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(publicPath, 'index.html'));
      }
    });
  } else {
    console.log('ℹ️  No static files to serve. Backend API mode only.');
  }
}

const startServer = async () => {
  try {
    // Connect to MongoDB and wait for connection to be established
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect to the database
    await connectDB();
    
    // Wait for the connection to be ready
    console.log('⏳ Waiting for database connection to be ready...');
    const isReady = await waitForConnection(15000); // 15 second timeout
    
    if (!isReady) {
      throw new Error('MongoDB connection is not ready after timeout');
    }
    
    console.log('✅ MongoDB connection established and ready');
    
    // Start the server
    console.log('🚀 Starting server...');
    server = app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      
      // Check configurations
      const emailConfig = checkEmailConfig();
      if (!emailConfig.success) {
        console.warn('⚠️ Email functionality may not work correctly due to missing configuration');
      }
      
      const cloudinaryConfig = checkCloudinaryConfig();
      if (!cloudinaryConfig.success) {
        console.warn('⚠️ Payment proof upload functionality may not work correctly due to missing Cloudinary configuration');
      }

      // Check MongoDB connection - essential for operation
      try {
        console.log('Checking MongoDB connection...');
        const mongoCheck = await checkMongoDbConnection();
        if (!mongoCheck.success) {
          console.error('❌ MongoDB connection failed. Server may not function properly.');
        } else {
          console.log('✅ MongoDB connection is working correctly.');
        }
      } catch (error) {
        console.error('❌ MongoDB connection check error:', error.message);
      }

      // Check if email configuration is set up
      const emailConfigCheck = checkEmailConfig();
      if (!emailConfigCheck.success) {
        console.warn('⚠️  Email configuration is incomplete. Email functionality will not work.');
        console.warn(`Missing variables: ${emailConfigCheck.missingVars.join(', ')}`);
      } else {
        console.log('✅ Email configuration is complete.');
      }

      // Check if Cloudinary configuration is set up
      const cloudinaryConfigCheck = checkCloudinaryConfig();
      if (!cloudinaryConfigCheck.success) {
        console.warn('⚠️  Cloudinary configuration is incomplete. Image upload will not work.');
        console.warn(`Missing variables: ${cloudinaryConfigCheck.missingVars.join(', ')}`);
      } else {
        console.log('✅ Cloudinary configuration is complete.');
      }
    });
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error(`Error al iniciar el servidor: ${error.message}`);
    if (error.code === 'EADDRINUSE') {
      console.error(`ERROR: Puerto ${PORT} ya está en uso.`);
    }
    process.exit(1);
  }
};

// Start the server
const start = async () => {
  try {
    await startServer();
  } catch (error) {
    console.error('❌ Failed to start the server:', error.message);
    process.exit(1);
  }
};

// Execute the startup sequence
start();

function gracefulShutdown() {
  console.log('Recibida señal de terminación, cerrando el servidor...');
  if (server) {
    server.close(() => {
      console.log('Servidor cerrado exitosamente');
      mongoose.connection.close(false, () => {
        console.log('Conexión MongoDB cerrada');
        process.exit(0);
      });
    });
    setTimeout(() => {
      console.error('No se pudo cerrar el servidor limpiamente, forzando salida');
      process.exit(1);
    }, 10000);
  } else {
    mongoose.connection.close(false, () => {
      console.log('Conexión MongoDB cerrada (servidor no estaba definido)');
      process.exit(0);
    });
  }
}
// Triggering nodemon restart to check DB connection

