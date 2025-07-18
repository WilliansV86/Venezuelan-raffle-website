require('dotenv').config();
const mongoose = require('mongoose');
const Raffle = require('./src/models/Raffle.js');

async function fixSpecificRaffle() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/venezuelanraffle');
    console.log('Connected to MongoDB');
    
    // Step 1: Log all raffles with their status
    const allRaffles = await Raffle.find({}).lean();
    console.log('\nAll raffles in database:');
    allRaffles.forEach(raffle => {
      console.log(`ID: ${raffle._id}, Name: ${raffle.name || raffle.title}, Status: "${raffle.status}"`);
    });
    
    // Step 2: Find the "Juega y gana" raffle specifically
    const juegaRaffle = await Raffle.findOne({
      $or: [
        { title: { $regex: /juega.*gana/i } },
        { name: { $regex: /juega.*gana/i } }
      ]
    });
    
    if (juegaRaffle) {
      console.log(`\nFound "Juega y gana" raffle with ID: ${juegaRaffle._id}`);
      console.log(`Current status: "${juegaRaffle.status}"`);
      
      // Step 3: Fix it to have exactly lowercase 'active'
      juegaRaffle.status = 'active';
      await juegaRaffle.save();
      console.log('Status updated to "active"');
    } else {
      console.log('Could not find "Juega y gana" raffle');
    }
    
    // Step 4: Set all other raffles with proper status
    // Update any raffles with 'Activo', 'ACTIVE', etc. to lowercase 'active'
    const activeUpdated = await Raffle.updateMany(
      { status: { $in: ['Activo', 'ACTIVE', 'Active'] } },
      { $set: { status: 'active' } }
    );
    
    // Update any raffles with 'Completado', 'COMPLETED', etc. to lowercase 'completed'
    const completedUpdated = await Raffle.updateMany(
      { status: { $in: ['Completado', 'COMPLETED', 'Completed'] } },
      { $set: { status: 'completed' } }
    );
    
    console.log(`\nUpdated ${activeUpdated.modifiedCount} raffles to 'active'`);
    console.log(`Updated ${completedUpdated.modifiedCount} raffles to 'completed'`);
    
    // Step 5: Log all raffles again to verify changes
    const updatedRaffles = await Raffle.find({}).lean();
    console.log('\nRaffles after update:');
    updatedRaffles.forEach(raffle => {
      console.log(`ID: ${raffle._id}, Name: ${raffle.name || raffle.title}, Status: "${raffle.status}"`);
    });
    
    console.log('\nFix complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixSpecificRaffle();
