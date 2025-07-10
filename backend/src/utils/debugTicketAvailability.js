/**
 * Debug Ticket Availability
 * 
 * This script will help us understand what's happening with the ticket availability checks
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function debugTicketAvailability() {
  console.log('=== Debugging Ticket Availability ===');
  
  // Get the MongoDB URI from environment variable or use the hardcoded one
  const mongoUri = process.env.MONGO_URI || 
    'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
  
  console.log(`Connecting to MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful!');
    
    // Get collections info
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections in database: ${collections.map(c => c.name).join(', ')}`);
    
    // Get raffle collection schema
    const raffleCollection = mongoose.connection.db.collection('raffles');
    
    // Get active raffles
    const activeRaffles = await raffleCollection.find({ status: 'active' }).toArray();
    console.log(`\nFound ${activeRaffles.length} active raffles`);
    
    // Detailed inspection of each raffle
    for (const raffle of activeRaffles) {
      console.log('\n=== Raffle Details ===');
      console.log(` - ID: ${raffle._id}`);
      console.log(` - Title: ${raffle.title || 'N/A'}`);
      console.log(` - Status: ${raffle.status || 'N/A'}`);
      console.log(` - Total Tickets: ${raffle.totalTickets || 'N/A'}`);
      console.log(` - Available Tickets: ${raffle.availableTickets || 'N/A'}`);
      
      // Check all ticket-related properties
      console.log('\n=== All Ticket-Related Properties ===');
      const raffleObj = raffle;
      Object.keys(raffleObj).forEach(key => {
        if (key.toLowerCase().includes('ticket')) {
          console.log(` - ${key}: ${JSON.stringify(raffleObj[key])}`);
        }
      });
      
      // Check if there are any actual tickets in the tickets collection
      const ticketCollection = mongoose.connection.db.collection('tickets');
      const ticketsForRaffle = await ticketCollection.countDocuments({ raffle: raffle._id });
      console.log(`\nTickets in 'tickets' collection for this raffle: ${ticketsForRaffle}`);
      
      // Get a sample ticket
      if (ticketsForRaffle > 0) {
        const sampleTicket = await ticketCollection.findOne({ raffle: raffle._id });
        console.log('Sample ticket:', sampleTicket);
      }
    }
    
    // Let's examine the tickets API-related code
    console.log('\n=== Examining API Routes ===');
    console.log('Checking for ticketRoutes in the application');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB debugging failed!');
    console.error(`Error: ${error.message}`);
    return false;
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\nMongoDB connection closed');
    }
  }
}

// Run the debug
debugTicketAvailability()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
  });
