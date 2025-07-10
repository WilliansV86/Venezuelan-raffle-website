/**
 * Update Ticket Availability
 * 
 * This script updates the ticket availability for active raffles
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function updateTickets() {
  console.log('Updating ticket availability for active raffles...');
  
  // Get the MongoDB URI from environment variable or use the hardcoded one
  const mongoUri = process.env.MONGO_URI || 
    'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
  
  console.log(`Connecting to MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful!');
    
    // Set number of tickets for active raffles
    const totalTickets = 500;
    const availableTickets = 500;
    const ticketPrice = 320; // in Bolivares
    
    console.log(`Setting active raffles to have ${totalTickets} total tickets with ${availableTickets} available`);
    console.log(`Setting ticket price to ${ticketPrice} Bs.`);
    
    // Update active raffles
    const result = await mongoose.connection.db.collection('raffles').updateMany(
      { status: 'active' },
      { $set: { 
          totalTickets: totalTickets, 
          availableTickets: availableTickets,
          price: ticketPrice
        }
      }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} active raffles`);
    
    // Get updated active raffles
    const activeRaffles = await mongoose.connection.db.collection('raffles').find({ status: 'active' }).toArray();
    console.log(`\nFound ${activeRaffles.length} active raffles after update`);
    
    for (const raffle of activeRaffles) {
      console.log('\n=== Updated Raffle Details ===');
      console.log(` - ID: ${raffle._id}`);
      console.log(` - Title: ${raffle.title || 'N/A'}`);
      console.log(` - Total Tickets: ${raffle.totalTickets || 'N/A'}`);
      console.log(` - Available Tickets: ${raffle.availableTickets || '0'}`);
      console.log(` - Price: ${raffle.price || 'N/A'} Bs.`);
      console.log(` - Draw Date: ${raffle.drawDate || 'N/A'}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ MongoDB update failed!');
    console.error(`Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\nMongoDB connection closed');
    }
  }
}

// Run the update
updateTickets()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
  });
