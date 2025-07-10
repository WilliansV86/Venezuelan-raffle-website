/**
 * Setup Four-Digit Tickets System
 * 
 * This script sets up the raffle with tickets numbered 0001-9999
 * and configures the system to track sold tickets properly.
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function setupFourDigitTickets() {
  console.log('Setting up four-digit ticket system (0001-9999)...');
  
  // Get the MongoDB URI from environment variable or use the hardcoded one
  const mongoUri = process.env.MONGO_URI || 
    'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
  
  console.log(`Connecting to MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful!');
    
    // Configure ticket system for 0001-9999
    const totalTickets = 9999;
    const ticketPrice = 320; // in Bolivares
    
    console.log(`\nSetting up ticket system with range 0001-${totalTickets.toString().padStart(4, '0')}`);
    console.log(`Setting ticket price to ${ticketPrice} Bs. each`);
    
    // Initialize empty array for sold tickets
    const soldTickets = [];
    
    // Update active raffles with new ticket structure
    const result = await mongoose.connection.db.collection('raffles').updateMany(
      { status: 'active' },
      { $set: { 
          ticketFormat: "0000", // Four-digit format with leading zeros
          ticketStart: 1,
          ticketEnd: totalTickets,
          totalTickets: totalTickets,
          availableTickets: totalTickets,
          soldTickets: soldTickets, // Start with empty array of sold tickets
          price: ticketPrice,
          percentageSold: 0 // 0% sold initially
        }
      }
    );
    
    console.log(`\n✅ Updated ${result.modifiedCount} active raffles with four-digit ticket system`);
    
    // Get updated active raffle
    const activeRaffles = await mongoose.connection.db.collection('raffles').find({ status: 'active' }).toArray();
    
    if (activeRaffles.length > 0) {
      const raffle = activeRaffles[0];
      console.log('\n=== Updated Raffle Details ===');
      console.log(` - ID: ${raffle._id}`);
      console.log(` - Title: ${raffle.title || 'N/A'}`);
      console.log(` - Ticket Format: ${raffle.ticketFormat || '0000'}`);
      console.log(` - Ticket Range: ${raffle.ticketStart || 1} to ${raffle.ticketEnd || totalTickets}`);
      console.log(` - Total Tickets: ${raffle.totalTickets || totalTickets}`);
      console.log(` - Available Tickets: ${raffle.availableTickets || totalTickets}`);
      console.log(` - Price: ${raffle.price || ticketPrice} Bs.`);
      console.log(` - Percentage Sold: ${raffle.percentageSold || 0}%`);
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

// Run the setup
setupFourDigitTickets()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
  });
