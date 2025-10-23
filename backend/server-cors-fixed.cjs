// Temporary debugging: Add a global error catcher to find the crash source
process.on('uncaughtException', (err, origin) => {
  console.error('----------------------------------------');
  console.error('FATAL: An uncaught exception occurred!');
  console.error('----------------------------------------');
  console.error('Error:', err);
  console.error('Origin:', origin);
  console.error('Stack Trace:', err.stack);
  process.exit(1); // Exit with failure code
});

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file FIRST.
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');
const healthCheckRoutes = require('./src/routes/healthCheck.js');
const raffleRoutes = require('./src/routes/raffleRoutes.js');
const adminRoutes = require('./src/routes/adminRoutes.js');
const ticketRoutes = require('./src/routes/ticketRoutes.js');
const transactionRoutes = require('./src/routes/transactionRoutes.js');

connectDB().then(() => {
    console.log('Database connection successful, starting web server...');
    const app = express();
    
    // Updated CORS options to allow requests from both localhost and Netlify domains
    const allowedOrigins = [
      'http://localhost:3000', 
      'https://tusuerte-admin.netlify.app',
      'https://tu-suerte-esta-aqui-ve.netlify.app'
    ];
    
    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          console.log("CORS blocked origin:", origin);
          callback(null, true); // Still allow for debugging, change to false in production if needed
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    };
    
    // Apply CORS middleware
    app.use(cors(corsOptions));
    
    // Add headers to all responses for better CORS compatibility
    app.use((req, res, next) => {
      // Log the request
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'}`);
      
      // Add CORS headers manually as a fallback
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      next();
    });
    
    app.use(express.json());

    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    const PORT = process.env.PORT || 5100;

    app.get('/', (req, res) => {
      res.send('Server with DB connection is running!');
    });

    app.use('/api/health', healthCheckRoutes);
    app.use('/api/raffles', raffleRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/transactions', transactionRoutes);

    try {
      console.log('Attempting to start server on port', PORT);
      const server = app.listen(PORT, () => {
        console.log(`Server with DB connection listening on port ${PORT}`);
        console.log(`CORS allowed origins: ${JSON.stringify(allowedOrigins)}`);
        console.log('Server started successfully!');
      });
      
      server.on('error', (error) => {
        console.error('Server failed to start:', error.message);
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${PORT} is already in use. Please close any other applications using this port.`);
        }
      });
    } catch (error) {
      console.error('Failed to start server:', error);
    }

}).catch(err => {
    console.error('Failed to connect to the database. Server will not start.', err);
    process.exit(1);
});
