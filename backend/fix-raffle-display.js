require('dotenv').config();
const mongoose = require('mongoose');

// Simple script to update all draft raffles to active so they display in the admin panel
(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully to MongoDB');

    // Define a simple raffle schema (only what we need)
    const raffleSchema = new mongoose.Schema({}, { strict: false });
    const Raffle = mongoose.model('Raffle', raffleSchema);
    
    // Get all raffles
    const allRaffles = await Raffle.find({});
    console.log(`Found ${allRaffles.length} total raffles`);
    
    // Count by status
    const statusMap = {};
    allRaffles.forEach(raffle => {
      const status = raffle.status || 'unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    
    console.log('Current raffle status counts:');
    Object.entries(statusMap).forEach(([status, count]) => {
      console.log(`- ${status}: ${count}`);
    });

    // Update any non-active/non-completed raffles to active
    const result = await Raffle.updateMany(
      { status: { $nin: ['active', 'completed'] } },
      { $set: { status: 'active' } }
    );
    
    console.log(`Updated ${result.modifiedCount} raffles to active status`);
    
    // Show updated counts
    const updatedRaffles = await Raffle.find({});
    const updatedStatusMap = {};
    updatedRaffles.forEach(raffle => {
      const status = raffle.status || 'unknown';
      updatedStatusMap[status] = (updatedStatusMap[status] || 0) + 1;
    });
    
    console.log('\nUpdated raffle status counts:');
    Object.entries(updatedStatusMap).forEach(([status, count]) => {
      console.log(`- ${status}: ${count}`);
    });
    
    console.log('\nDone! Raffles should now appear in the admin panel.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})();
