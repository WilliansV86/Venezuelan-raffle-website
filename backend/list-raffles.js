// Script to list all raffles in the database
require('dotenv').config();
const mongoose = require('mongoose');
const Raffle = require('./src/models/Raffle.js');

async function listRaffles() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all raffles
    const allRaffles = await Raffle.find({}).lean();
    
    console.log('\n=== RAFFLE STATUS SUMMARY ===');
    console.log(`Total raffles: ${allRaffles.length}`);
    
    // Count by status
    const statusCounts = {};
    allRaffles.forEach(raffle => {
      statusCounts[raffle.status] = (statusCounts[raffle.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count} raffles`);
    });
    
    console.log('\n=== RAFFLE DETAILS ===');
    allRaffles.forEach(raffle => {
      console.log(`\nID: ${raffle._id}`);
      console.log(`Name: ${raffle.name}`);
      console.log(`Status: ${raffle.status}`);
      console.log(`Created: ${raffle.createdAt}`);
      console.log(`Updated: ${raffle.updatedAt}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

listRaffles();
