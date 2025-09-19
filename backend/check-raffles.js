// Simple script to check raffles in the database
require('dotenv').config();
const mongoose = require('mongoose');
const Raffle = require('./src/models/Raffle.js');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    checkRaffles();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function checkRaffles() {
  try {
    // Get all raffles
    const allRaffles = await Raffle.find({});
    console.log('Total raffles in database:', allRaffles.length);
    
    // Group by status
    const draftRaffles = allRaffles.filter(raffle => raffle.status === 'draft');
    const activeRaffles = allRaffles.filter(raffle => raffle.status === 'active');
    const completedRaffles = allRaffles.filter(raffle => raffle.status === 'completed');
    
    console.log('Draft raffles:', draftRaffles.length);
    console.log('Active raffles:', activeRaffles.length);
    console.log('Completed raffles:', completedRaffles.length);
    
    // Show details of each raffle
    console.log('\nRaffle details:');
    allRaffles.forEach(raffle => {
      console.log(`ID: ${raffle._id}, Name: ${raffle.name}, Status: ${raffle.status}`);
    });
    
    // If we don't have any active raffles, create one for testing
    if (activeRaffles.length === 0 && draftRaffles.length > 0) {
      console.log('\nUpdating a draft raffle to active status for testing...');
      const draftRaffle = draftRaffles[0];
      draftRaffle.status = 'active';
      await draftRaffle.save();
      console.log(`Raffle ${draftRaffle._id} updated to active status.`);
    }
    
    // If we don't have any completed raffles, create one for testing
    if (completedRaffles.length === 0 && draftRaffles.length > 1) {
      console.log('\nUpdating a draft raffle to completed status for testing...');
      const draftRaffle = draftRaffles[1];
      draftRaffle.status = 'completed';
      await draftRaffle.save();
      console.log(`Raffle ${draftRaffle._id} updated to completed status.`);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking raffles:', error);
    mongoose.connection.close();
  }
}
