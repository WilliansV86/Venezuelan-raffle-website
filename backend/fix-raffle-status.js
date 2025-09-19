require('dotenv').config();
const mongoose = require('mongoose');

async function fixRaffleStatus() {
  let connection;
  try {
    console.log('Connecting to MongoDB...');
    connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected Successfully!');
    
    // Define a simple schema for raffles collection
    const RaffleSchema = new mongoose.Schema({}, { strict: false, collection: 'raffles' });
    const Raffle = mongoose.model('Raffle', RaffleSchema);
    
    // Find all raffles
    const allRaffles = await Raffle.find({});
    console.log(`Found ${allRaffles.length} total raffles`);
    
    // Group by status
    const statusGroups = allRaffles.reduce((acc, raffle) => {
      const status = raffle.status || 'unknown';
      if (!acc[status]) acc[status] = [];
      acc[status].push(raffle);
      return acc;
    }, {});
    
    console.log('\nRaffles by status:');
    Object.entries(statusGroups).forEach(([status, raffles]) => {
      console.log(`- ${status}: ${raffles.length} raffles`);
    });
    
    // Find draft raffles to update
    const draftRaffles = allRaffles.filter(r => r.status === 'draft');
    
    if (draftRaffles.length > 0) {
      console.log('\nDraft raffles:');
      draftRaffles.forEach((raffle, index) => {
        console.log(`${index+1}. ${raffle._id}: "${raffle.name || 'Unnamed'}"`);
      });
      
      // Update the first draft raffle to 'active'
      const targetRaffle = draftRaffles[0];
      console.log(`\nUpdating raffle "${targetRaffle.name}" (${targetRaffle._id}) to 'active' status...`);
      
      const result = await Raffle.updateOne(
        { _id: targetRaffle._id },
        { $set: { status: 'active' } }
      );
      
      console.log(`Update result: ${JSON.stringify(result)}`);
      
      if (result.modifiedCount > 0) {
        console.log('✓ Raffle updated successfully to "active" status!');
      } else {
        console.log('! Raffle was not updated. Please check MongoDB logs.');
      }
    } else {
      console.log('No draft raffles found to update.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    console.log('\nClosing MongoDB connection...');
    if (connection) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the update
fixRaffleStatus();
