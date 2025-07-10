/**
 * Check Tickets Availability
 * 
 * This script checks the ticket availability for active raffles
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function checkTickets() {
  console.log('Checking ticket availability for raffles...');
  
  // Get the MongoDB URI from environment variable or use the hardcoded one
  const mongoUri = process.env.MONGO_URI || 
    'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';
  
  console.log(`Connecting to MongoDB: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful!');
    
    // Get active raffles
    const activeRaffles = await mongoose.connection.db.collection('raffles').find({ status: 'active' }).toArray();
    console.log(`\nFound ${activeRaffles.length} active raffles`);
    
    for (const raffle of activeRaffles) {
      console.log('\n=== Raffle Details ===');
      console.log(` - ID: ${raffle._id}`);
      console.log(` - Title: ${raffle.title || 'N/A'}`);
      console.log(` - Description: ${raffle.description ? raffle.description.substring(0, 30) + '...' : 'N/A'}`);
      console.log(` - Total Tickets: ${raffle.totalTickets || 'N/A'}`);
      console.log(` - Available Tickets: ${raffle.availableTickets || '0'}`);
      console.log(` - Price: ${raffle.price || 'N/A'}`);
      console.log(` - Draw Date: ${raffle.drawDate || 'N/A'}`);
      
      // Check if ticket availability is properly set
      if (!raffle.totalTickets || raffle.totalTickets <= 0) {
        console.log('⚠️ WARNING: Total tickets is not set or is zero!');
        console.log('   This will prevent ticket purchases.');
      }
      
      if (!raffle.availableTickets || raffle.availableTickets <= 0) {
        console.log('⚠️ WARNING: Available tickets is zero!');
        console.log('   This will prevent ticket purchases.');
      }
    }
    
    // Print how to update tickets if needed
    console.log('\n=== How to Fix Ticket Availability ===');
    console.log('Run this command in MongoDB shell or Compass:');
    console.log('db.raffles.updateOne({ status: "active" }, { $set: { availableTickets: 500, totalTickets: 500 } })');
    
    return { success: true };
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
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

// Run the check
checkTickets()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Uncaught error:', error);
    process.exit(1);
  });
