/**
 * Fix Ticket Availability
 * 
 * This script fixes ticket availability issues by ensuring the raffle schema
 * has the correct structure for our non-sequential ticket system
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function fixTicketAvailability() {
  console.log('=== FIXING TICKET AVAILABILITY ===');
  
  // Get the MongoDB URI from environment variable or use the hardcoded one
  const mongoUri = process.env.MONGO_URI || 
    'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
  
  console.log(`Connecting to MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful!');
    
    // Find active raffles
    const raffles = await mongoose.connection.db.collection('raffles').find({ status: 'active' }).toArray();
    
    if (raffles.length === 0) {
      console.log('No active raffles found.');
      return;
    }
    
    console.log(`Found ${raffles.length} active raffles.`);
    
    for (const raffle of raffles) {
      console.log(`\n===== Processing raffle: ${raffle.title} =====`);
      
      // Fix ticket format
      if (!raffle.ticketFormat) {
        console.log('Setting ticket format to 0000');
        await mongoose.connection.db.collection('raffles').updateOne(
          { _id: raffle._id },
          { $set: { ticketFormat: "0000" } }
        );
      }
      
      // Ensure ticketStart and ticketEnd are set
      if (!raffle.ticketStart || !raffle.ticketEnd) {
        console.log('Setting ticket range to 1-9999');
        await mongoose.connection.db.collection('raffles').updateOne(
          { _id: raffle._id },
          { $set: { ticketStart: 1, ticketEnd: 9999 } }
        );
      }
      
      // Create empty soldTickets array if it doesn't exist
      if (!raffle.soldTickets) {
        console.log('Creating empty soldTickets array');
        await mongoose.connection.db.collection('raffles').updateOne(
          { _id: raffle._id },
          { $set: { soldTickets: [] } }
        );
      }
      
      // === FIX THE AVAILABLE TICKETS PROPERTY ===
      // This is the key issue - we need to make sure availableTickets is a NUMBER
      // not an array or other data type
      console.log('Setting availableTickets to be a NUMBER (9999)');
      await mongoose.connection.db.collection('raffles').updateOne(
        { _id: raffle._id },
        { $set: { 
            availableTickets: 9999,
            totalTickets: 9999,
            percentageSold: 0
          } 
        }
      );
      
      // Get updated raffle
      const updatedRaffle = await mongoose.connection.db.collection('raffles').findOne({ _id: raffle._id });
      
      console.log('\nRaffle after fixes:');
      console.log(` - Available Tickets: ${updatedRaffle.availableTickets} (${typeof updatedRaffle.availableTickets})`);
      console.log(` - Total Tickets: ${updatedRaffle.totalTickets}`);
      console.log(` - Ticket Format: ${updatedRaffle.ticketFormat}`);
      console.log(` - Ticket Range: ${updatedRaffle.ticketStart}-${updatedRaffle.ticketEnd}`);
      console.log(` - Sold Tickets: ${(updatedRaffle.soldTickets || []).length} tickets`);
    }
    
    console.log('\n✅ Successfully fixed ticket availability issues!');
    return true;
  } catch (error) {
    console.error('❌ Error fixing ticket availability:', error);
    return false;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\nMongoDB connection closed');
    }
  }
}

// Run the function
fixTicketAvailability()
  .then(() => {
    console.log('\nFix completed, please restart the server for changes to take effect');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
