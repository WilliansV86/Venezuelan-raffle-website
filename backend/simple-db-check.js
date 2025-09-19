require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    console.log(`MONGO_URI starts with: ${process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + '...' : 'undefined'}`);
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB Connected Successfully!');
    
    // Define a simple schema for raffles collection
    const RaffleSchema = new mongoose.Schema({}, { strict: false, collection: 'raffles' });
    const Raffle = mongoose.model('Raffle', RaffleSchema);
    
    // Count raffles
    const raffleCount = await Raffle.countDocuments();
    console.log(`✓ Found ${raffleCount} raffles in the database`);
    
    if (raffleCount > 0) {
      // Get a sample of raffles
      const raffles = await Raffle.find().limit(5).lean();
      console.log('Sample raffles:');
      console.log(JSON.stringify(raffles, null, 2));
    }
    
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the check
checkDatabase();
