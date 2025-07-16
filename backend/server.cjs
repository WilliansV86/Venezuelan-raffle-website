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
// This is critical. It must happen before any other file is imported.
dotenv.config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');
const healthCheckRoutes = require('./src/routes/healthCheck.js');
const raffleRoutes = require('./src/routes/raffleRoutes.js');
const adminRoutes = require('./src/routes/adminRoutes.js');

connectDB().then(() => {
    console.log('Database connection successful, starting web server...');
    const app = express();
    
    // Configure CORS to allow all requests temporarily to fix connection issues
    app.use(cors());
    
    // Log all incoming requests to help diagnose connection issues
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
    
    app.use(express.json());
    const PORT = 5100;

    app.get('/', (req, res) => {
      res.send('Server with DB connection is running!');
    });

    app.use('/api/health', healthCheckRoutes);
    app.use('/api/raffles', raffleRoutes);
    app.use('/api/admin', adminRoutes);



    try {
      console.log('Attempting to start server on port', PORT);
      const server = app.listen(PORT, () => {
        console.log(`Server with DB connection listening on port ${PORT}`);
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
