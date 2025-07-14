require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const logFile = 'mongodb-check.log';
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Log to both console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

// Get current IP address (approximate method)
async function getPublicIP() {
  try {
    log('Attempting to get public IP address...');
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over internal (i.e. 127.0.0.1) and non-IPv4 addresses
        if (net.family === 'IPv4' && !net.internal) {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }
    
    log('Network interfaces found:');
    log(JSON.stringify(results, null, 2));
    
    return results;
  } catch (error) {
    log(`Error getting IP: ${error.message}`);
    return "Unknown";
  }
}

async function checkMongoDB() {
  log('MongoDB Connection Check');
  log('=======================');
  
  // Check environment variables
  const uri = process.env.MONGO_URI;
  if (!uri) {
    log('ERROR: MONGO_URI is not defined in .env file');
    return;
  }
  
  log(`MONGO_URI exists: ${uri.substring(0, 20)}...`);
  
  // Get IP information
  const ipInfo = await getPublicIP();
  log(`Your current local IP addresses: ${JSON.stringify(ipInfo)}`);
  log('IMPORTANT: Make sure to whitelist your current public IP in MongoDB Atlas');
  
  // Try connecting to MongoDB
  try {
    log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    log('✓ MongoDB Connected Successfully!');
    
    // Define a simple schema to query the raffles collection
    const RaffleSchema = new mongoose.Schema({}, { strict: false, collection: 'raffles' });
    const Raffle = mongoose.model('Raffle', RaffleSchema);
    
    // Count raffles
    const raffleCount = await Raffle.countDocuments();
    log(`✓ Found ${raffleCount} raffles in the database`);
    
    if (raffleCount === 0) {
      log('No raffles found! This explains the "Not Found - raffles" error.');
      log('You need to create at least one raffle.');
    } else {
      // List raffles
      log('Listing all raffles:');
      const raffles = await Raffle.find({}, { name: 1, status: 1 });
      raffles.forEach(raffle => {
        log(`- ${raffle.name || 'Unnamed'} (Status: ${raffle.status || 'Unknown'})`);
      });
    }
    
  } catch (error) {
    log(`✗ MongoDB Connection ERROR: ${error.message}`);
    log('');
    log('TROUBLESHOOTING STEPS:');
    log('1. Verify your MongoDB Atlas cluster is running');
    log('2. Confirm the MONGO_URI is correct in your .env file');
    log('3. Make sure your current IP address is whitelisted in MongoDB Atlas');
    log('   Go to: MongoDB Atlas Dashboard > Network Access > Add IP Address');
    log('4. Check if your internet connection is working properly');
  } finally {
    // Close connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      log('MongoDB connection closed');
    }
    logStream.end();
  }
}

// Run the check
checkMongoDB().catch(err => {
  log(`Uncaught error: ${err.message}`);
  logStream.end();
});
