require('dotenv').config();
const mongoose = require('mongoose');
const Raffle = require('./src/models/Raffle.js');

async function resetAllRafflesToDraft() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/venezuelanraffle');
    console.log('Connected to MongoDB');
    
    // Step 1: Log all raffles with their current status
    const beforeRaffles = await Raffle.find({}).lean();
    console.log('\nRaffles before reset:');
    beforeRaffles.forEach(raffle => {
      console.log(`ID: ${raffle._id}, Name: ${raffle.name || raffle.title}, Status: "${raffle.status}"`);
    });
    
    // Step 2: Reset ALL raffles to have status "draft"
    const result = await Raffle.updateMany(
      {}, // Match all documents
      { $set: { status: 'draft' } }
    );
    
    console.log(`\nReset ${result.modifiedCount} raffles to 'draft' status`);
    
    // Step 3: Log all raffles after reset
    const afterRaffles = await Raffle.find({}).lean();
    console.log('\nRaffles after reset to draft:');
    afterRaffles.forEach(raffle => {
      console.log(`ID: ${raffle._id}, Name: ${raffle.name || raffle.title}, Status: "${raffle.status}"`);
    });
    
    console.log('\nReset complete! All raffles now have "draft" status.');
    console.log('You can now manually set them to "active" or "completed" as needed.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

resetAllRafflesToDraft();
