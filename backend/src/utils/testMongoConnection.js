/**
 * MongoDB Connection Test Utility
 * 
 * This script tests the MongoDB connection directly
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoConnection() {
  console.log('Testing MongoDB connection...');
  
  // Get the MongoDB URI from environment variable or use the hardcoded one
  const mongoUri = process.env.MONGO_URI || 
    'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
  
  console.log(`Connecting to: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
  console.log(`From IP address: (Your current IP needs to be whitelisted)`);
  
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // List all collections to verify data access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
    // Check if raffles collection exists and has documents
    if (collections.some(c => c.name === 'raffles')) {
      const rafflesCount = await mongoose.connection.db.collection('raffles').countDocuments();
      console.log(`\nFound ${rafflesCount} raffles in database`);
      
      // Get a sample raffle to verify data
      if (rafflesCount > 0) {
        const sampleRaffle = await mongoose.connection.db.collection('raffles').findOne();
        console.log('\nSample raffle:');
        console.log(` - ID: ${sampleRaffle._id}`);
        console.log(` - Title: ${sampleRaffle.title || 'N/A'}`);
        console.log(` - Status: ${sampleRaffle.status || 'N/A'}`);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error(`Error: ${error.message}`);
    
    // Provide guidance based on error message
    if (error.message.includes('ENOTFOUND') || error.message.includes('timed out')) {
      console.error('\nPossible issues:');
      console.error(' - Internet connection problem');
      console.error(' - MongoDB Atlas server is down');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\nAuthentication failed:');
      console.error(' - Username or password is incorrect');
    } else if (error.message.includes('IP address')) {
      console.error('\nIP Address not allowed:');
      console.error(' - Your current IP address is not in the MongoDB Atlas whitelist');
      console.error(' - Log in to MongoDB Atlas and add your current IP address');
      console.error(' - Go to: Network Access > Add IP Address > Add Current IP Address');
    }
    
    return { success: false, error: error.message };
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\nMongoDB connection closed');
    }
  }
}

// Run the test and handle results
testMongoConnection()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
  });
