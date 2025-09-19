const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

console.log('Starting combined server...');

// Load environment variables
console.log('Loading environment variables...');
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
console.log('Environment variables loaded');

// Simple MongoDB connection function
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in your .env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Create Express app
const app = express();

// Basic middleware
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());

// Serve frontend static files
console.log('Setting up static file serving...');
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Simple API route to test connection
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Redirect all other requests to the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Connect to database then start server
console.log('Attempting to connect to database...');
connectDB().then(() => {
  console.log('Database connection successful, starting web server...');
  const PORT = 5000;
  
  app.listen(PORT, () => {
    console.log(`Combined server running on port ${PORT}`);
    console.log(`Open your browser to http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to the database. Server will not start.', err);
});
