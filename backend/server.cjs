console.log('Server process starting...');

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/db.js');
const raffleRoutes = require('./src/routes/raffleRoutes.js');
const adminRoutes = require('./src/routes/adminRoutes.js');
const healthCheckRoutes = require('./src/routes/healthCheck.js');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware.js');
const cors = require('cors');

console.log('Attempting to configure environment variables...');
dotenv.config();
console.log('Environment variables configured.');

if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI was not loaded from the .env file. Please check the file for syntax errors.');
  process.exit(1);
}

console.log('MONGO_URI found. Attempting to connect to database...');
connectDB().then(() => {
  console.log('Database connection successful, starting web server...');
  const app = express();

  // Enhanced CORS configuration for production and development
  const allowedOrigins = ['http://localhost:3000', 'https://tusuerte-admin.netlify.app'];

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(express.json());
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  // Simple test endpoint that bypasses all middleware
  app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Backend server is accessible', time: new Date().toISOString() });
  });

  app.use('/api/raffles', raffleRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/health', healthCheckRoutes);

  // Debug endpoint to check environment variables are loaded
  app.get('/api/debug-vars', (req, res) => {
    console.log('Debug endpoint called');
    res.json({
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminKey: !!process.env.ADMIN_KEY,
      port: process.env.PORT || '5100'
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  const PORT = process.env.PORT || 5100;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to the database. Server will not start.', err);
  process.exit(1);
});
