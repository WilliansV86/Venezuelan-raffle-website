/**
 * Check Raffle Status Script
 * 
 * This script checks for raffles with status 'active' or 'completed'
 * in the database and prints a summary
 * 
 * Run with: node src/utils/checkRaffleStatus.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
}

// Function to check raffle status
async function checkRaffleStatus() {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.log('Failed to connect to MongoDB. Exiting.');
      process.exit(1);
    }

    // Get the collection
    const rafflesCollection = mongoose.connection.db.collection('raffles');
    
    // Count active raffles
    const activeCount = await rafflesCollection.countDocuments({ status: 'active' });
    console.log(`Active raffles: ${activeCount}`);
    
    // Count completed raffles
    const completedCount = await rafflesCollection.countDocuments({ status: 'completed' });
    console.log(`Completed raffles: ${completedCount}`);
    
    // Count total raffles with these statuses
    const totalCount = await rafflesCollection.countDocuments({ status: { $in: ['active', 'completed'] } });
    console.log(`Total raffles (active + completed): ${totalCount}`);
    
    // Optional: Get a sample of the raffles to see their structure
    const sampleRaffles = await rafflesCollection.find({}).limit(1).toArray();
    if (sampleRaffles.length > 0) {
      console.log('\nSample raffle document structure:');
      console.log(JSON.stringify(sampleRaffles[0], null, 2));
    } else {
      console.log('\nNo raffles found in the database.');
    }

    await mongoose.connection.close();
    return { activeCount, completedCount, totalCount };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  checkRaffleStatus()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { checkRaffleStatus };
