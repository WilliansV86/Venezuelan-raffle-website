// MongoDB connection diagnostic script
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const http = require('http');
const url = require('url');

console.log('=============== SYSTEM DIAGNOSTIC ===============');
console.log('MongoDB Connection Test');
console.log('Time:', new Date().toISOString());

// Environment variables
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('ERROR: MONGO_URI environment variable is not defined');
  process.exit(1);
}

// Sanitize and display connection string (hide password)
const sanitizedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log('Connection string:', sanitizedUri);

// Parse the MongoDB URI
const parsedUrl = url.parse(mongoUri);
const hostname = parsedUrl.hostname;

console.log('Target MongoDB host:', hostname);

// Check DNS resolution
console.log('\nDNS Resolution Test:');
dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.error('DNS resolution failed:', err.message);
  } else {
    console.log(`DNS resolved to: ${address} (IPv${family})`);
  }

  // Try to connect to MongoDB
  console.log('\nConnecting to MongoDB:');
  
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('✅ SUCCESS: MongoDB connection established!');
      console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
      console.log(`Host: ${mongoose.connection.host}`);
      
      // List collections
      return mongoose.connection.db.listCollections().toArray();
    })
    .then(collections => {
      console.log('\nAvailable collections:');
      if (collections.length === 0) {
        console.log('No collections found - database is empty.');
      } else {
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });
      }
      
      mongoose.connection.close();
      console.log('\nConnection test complete.');
    })
    .catch(error => {
      console.error('❌ ERROR: MongoDB connection failed!');
      console.error(`Reason: ${error.message}`);
      
      // More detailed error information
      if (error.name === 'MongoServerSelectionError') {
        console.error('\nThis error typically indicates:');
        console.error('1. Your IP address is not whitelisted in MongoDB Atlas');
        console.error('2. Network connectivity issues to the MongoDB server');
        console.error('3. MongoDB server may be down or unreachable');
        
        console.error('\nRECOMMENDED ACTIONS:');
        console.error('1. Log in to MongoDB Atlas dashboard');
        console.error('2. Go to Network Access section');
        console.error('3. Add your current IP address to the whitelist');
        console.error('   OR enable "Allow Access from Anywhere" (0.0.0.0/0)');
      }
      
      process.exit(1);
    });
});
