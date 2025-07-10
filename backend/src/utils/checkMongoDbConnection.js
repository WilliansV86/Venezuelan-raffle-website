/**
 * MongoDB Connection Validator
 * 
 * This script tests the MongoDB connection and verifies IP whitelisting.
 * Run with: node src/utils/checkMongoDbConnection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const os = require('os');
const dns = require('dns');
const { promisify } = require('util');
const lookupAsync = promisify(dns.lookup);

async function getPublicIp() {
  try {
    // This is a simple way to get an approximation of the public IP
    // For production, consider using a more reliable method or service
    const interfaces = os.networkInterfaces();
    // Just logging the available interfaces for debugging
    console.log('Available network interfaces:');
    Object.keys(interfaces).forEach(iface => {
      interfaces[iface].forEach(details => {
        if (details.family === 'IPv4' && !details.internal) {
          console.log(`  ${iface}: ${details.address}`);
        }
      });
    });
    
    return 'Check MongoDB Atlas whitelist';
  } catch (error) {
    console.error('Error getting public IP:', error);
    return 'Unknown';
  }
}

async function checkMongoDbConnection() {
  console.log('Testing MongoDB connection...');
  console.log(`MongoDB URI: ${process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + '...' : 'Not set'}`);
  
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is not set');
    console.error('Please check your .env file and add a valid MongoDB connection string');
    return { success: false, error: 'Missing MONGO_URI' };
  }
  
  try {
    const publicIp = await getPublicIp();
    console.log(`Your approximate public IP address: ${publicIp}`);
    console.log('If connection fails, you need to whitelist this IP in MongoDB Atlas');
    
    // Set a timeout for the connection attempt
    const connectTimeout = setTimeout(() => {
      console.error('❌ MongoDB connection timeout');
      console.error('This usually indicates that your IP is not whitelisted in MongoDB Atlas');
      console.error('Please go to MongoDB Atlas > Network Access and add your IP address');
      process.exit(1);
    }, 10000); // 10 seconds timeout
    
    // Try to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Clear the timeout since we connected successfully
    clearTimeout(connectTimeout);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nAvailable collections in database:`);
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection test completed successfully');
    
    return { success: true };
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('The MongoDB server hostname could not be resolved');
      console.error('Check your internet connection or MongoDB Atlas status');
    } else if (error.message.includes('Authentication failed')) {
      console.error('Authentication failed - check your username and password in the MONGO_URI');
    } else if (error.message.includes('connection timed out') || 
               error.message.includes('connection closed')) {
      console.error('This usually indicates that your IP is not whitelisted in MongoDB Atlas');
      console.error('Please go to MongoDB Atlas > Network Access and add your IP address');
      console.error('You can temporarily allow access from anywhere by adding 0.0.0.0/0');
    }
    
    return { success: false, error: error.message };
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkMongoDbConnection()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = checkMongoDbConnection;
