// Test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');

// Get the MongoDB URI from environment variables
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('MONGO_URI environment variable is not defined');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
console.log('Connection string format (redacted password):', 
  mongoUri.replace(/:[^:]*@/, ':****@'));

// Set mongoose options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
};

mongoose.connect(mongoUri, options)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('Connected to database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    // Test accessing a collection
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('Available collections:');
    collections.forEach((collection) => {
      console.log('- ' + collection.name);
    });
    mongoose.connection.close();
    console.log('Connection closed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      console.error('This error usually means the server cannot be reached due to network issues');
      console.error('Please check:');
      console.error('1. Your network connection');
      console.error('2. IP whitelisting in MongoDB Atlas');
      console.error('3. MongoDB server status');
    }
    process.exit(1);
  });
