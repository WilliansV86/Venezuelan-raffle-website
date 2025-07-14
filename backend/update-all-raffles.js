require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Define Raffle schema dynamically (simplified version)
    const raffleSchema = new mongoose.Schema({
      name: String,
      description: String,
      status: String,
      // Add other fields as needed
    }, { strict: false });
    
    // Create model
    const Raffle = mongoose.model('Raffle', raffleSchema);
    
    try {
      // Find all raffles and display their statuses
      console.log('Checking raffle statuses...');
      const allRaffles = await Raffle.find({});
      
      console.log(`Found ${allRaffles.length} raffles in the database`);
      console.log('Current status breakdown:');
      
      // Count raffles by status
      const statusCount = {};
      allRaffles.forEach(raffle => {
        statusCount[raffle.status] = (statusCount[raffle.status] || 0) + 1;
      });
      
      // Display current status counts
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`- ${status || 'undefined'}: ${count}`);
      });
      
      // Update all non-active raffles to active
      console.log('\nUpdating all draft/unknown raffles to active status...');
      const updateResult = await Raffle.updateMany(
        { status: { $nin: ['active', 'completed'] } }, 
        { $set: { status: 'active' } }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} raffles to 'active' status`);
      
      // Verify the update
      const afterUpdate = await Raffle.find({});
      const afterStatusCount = {};
      afterUpdate.forEach(raffle => {
        afterStatusCount[raffle.status] = (afterStatusCount[raffle.status] || 0) + 1;
      });
      
      console.log('\nAfter update status breakdown:');
      Object.entries(afterStatusCount).forEach(([status, count]) => {
        console.log(`- ${status || 'undefined'}: ${count}`);
      });
      
      console.log('\nUpdate complete!');
    } catch (error) {
      console.error('Error updating raffles:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
