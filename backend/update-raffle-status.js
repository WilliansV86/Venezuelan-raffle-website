require('dotenv').config();
const mongoose = require('mongoose');

async function updateRaffleStatus() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB Connected Successfully!');
    
    // Define a simple schema for raffles collection
    const RaffleSchema = new mongoose.Schema({}, { strict: false, collection: 'raffles' });
    const Raffle = mongoose.model('Raffle', RaffleSchema);
    
    // Find draft raffles
    const draftRaffles = await Raffle.find({ status: 'draft' });
    console.log(`Found ${draftRaffles.length} raffles with 'draft' status`);
    
    if (draftRaffles.length > 0) {
      console.log('Draft raffles:');
      draftRaffles.forEach(raffle => {
        console.log(`- ${raffle._id}: ${raffle.name}`);
      });
      
      // Update one raffle to 'active' status
      const firstDraftRaffle = draftRaffles[0];
      console.log(`\nUpdating raffle "${firstDraftRaffle.name}" (${firstDraftRaffle._id}) to 'active' status...`);
      
      await Raffle.updateOne(
        { _id: firstDraftRaffle._id },
        { $set: { status: 'active' } }
      );
      
      console.log('✓ Raffle updated successfully!');
      console.log('\nYou should now be able to see this raffle in your admin panel.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the update
updateRaffleStatus();
