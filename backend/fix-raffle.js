require('dotenv').config();
const mongoose = require('mongoose');
const Raffle = require('./src/models/Raffle.js');

async function fixRaffleStatuses() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/venezuelanraffle');
    console.log('Connected to MongoDB');
    
    // First, let's see what we have in the database
    const raffles = await Raffle.find({});
    console.log('\nAll raffles before fixes:');
    raffles.forEach(r => console.log(`ID: ${r._id.toString()}, Name: ${r.name || r.title}, Status: ${r.status}`));
    
    // Fix the specific "Juega y gana" raffle - make sure it's active
    const juegaYGanaRaffle = raffles.find(r => 
      (r.name && r.name.toLowerCase().includes('juega y gana')) || 
      (r.title && r.title.toLowerCase().includes('juega y gana')));
    
    if (juegaYGanaRaffle) {
      console.log(`\nFound "Juega y gana" raffle with ID: ${juegaYGanaRaffle._id}`);
      console.log(`Current status: ${juegaYGanaRaffle.status}`);
      
      // Update to 'active' status
      juegaYGanaRaffle.status = 'active';
      await juegaYGanaRaffle.save();
      console.log(`Fixed "Juega y gana" raffle status to: ${juegaYGanaRaffle.status}`);
    } else {
      console.log('\nCould not find the "Juega y gana" raffle');
    }
    
    // Make all other raffles with "Activo" or similar status to be explicitly "active"
    const activeFixResult = await Raffle.updateMany(
      { status: { $in: ['Activo', 'ACTIVE', 'Active'] } },
      { $set: { status: 'active' } }
    );
    console.log(`\nFixed ${activeFixResult.modifiedCount} other raffles with incorrect active status`);
    
    // Make all raffles with "Completado" or similar status to be explicitly "completed"
    const completedFixResult = await Raffle.updateMany(
      { status: { $in: ['Completado', 'COMPLETED', 'Completed'] } },
      { $set: { status: 'completed' } }
    );
    console.log(`Fixed ${completedFixResult.modifiedCount} other raffles with incorrect completed status`);
    
    // Check the results
    const afterRaffles = await Raffle.find({});
    console.log('\nAll raffles after fixes:');
    afterRaffles.forEach(r => console.log(`ID: ${r._id.toString()}, Name: ${r.name || r.title}, Status: ${r.status}`));
    
    console.log('\nFix complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixRaffleStatuses();
