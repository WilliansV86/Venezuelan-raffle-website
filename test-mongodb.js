require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is not set!');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected successfully to:', mongoose.connection.host);
    
    // List collections
    const collections = await mongoose.connection.db.collections();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.collectionName}`);
    });
    
    // Check if we can query the raffles collection
    const Raffle = mongoose.model('Raffle', new mongoose.Schema({}), 'raffles');
    const raffles = await Raffle.find({ status: 'active' });
    console.log(`Found ${raffles.length} active raffles:`);
    console.log(JSON.stringify(raffles, null, 2));
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error(error);
  }
}

testConnection();
