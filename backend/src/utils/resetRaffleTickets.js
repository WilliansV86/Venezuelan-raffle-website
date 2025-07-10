/**
 * Reset Raffle Tickets
 * 
 * This script completely resets the raffle ticket system to ensure proper operation
 * with the four-digit non-sequential ticket system (0001-9999)
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function resetRaffleTickets() {
  console.log('COMPLETELY RESETTING raffle ticket system...');
  
  // Get the MongoDB URI from environment variable or use the hardcoded one
  const mongoUri = process.env.MONGO_URI || 
    'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
  
  console.log(`Connecting to MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful!');
    
    // Find and update all active raffles
    const result = await mongoose.connection.db.collection('raffles').updateMany(
      { status: 'active' },
      { 
        $set: { 
          ticketFormat: "0000",
          ticketStart: 1,
          ticketEnd: 9999,
          totalTickets: 9999,
          availableTickets: 9999,
          soldTickets: [],
          percentageSold: 0
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} active raffles`);
    
    // Delete all existing tickets to start fresh
    const ticketsDeleted = await mongoose.connection.db.collection('tickets').deleteMany({});
    console.log(`Deleted ${ticketsDeleted.deletedCount} existing tickets`);
    
    // Check if the update was successful
    const updatedRaffles = await mongoose.connection.db.collection('raffles').find({ status: 'active' }).toArray();
    
    if (updatedRaffles.length > 0) {
      console.log('\n=== Reset Completed Successfully ===');
      for (const raffle of updatedRaffles) {
        console.log(`- Raffle: ${raffle.title}`);
        console.log(`  Available Tickets: ${raffle.availableTickets}`);
        console.log(`  Total Tickets: ${raffle.totalTickets}`);
        console.log(`  Sold Tickets: ${(raffle.soldTickets || []).length}`);
      }
    } else {
      console.log('No active raffles found');
    }
    
  } catch (error) {
    console.error('❌ Error resetting raffle tickets:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\nMongoDB connection closed');
    }
  }
}

resetRaffleTickets()
  .then(() => {
    console.log('\nReset completed, please restart the server for changes to take effect');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
