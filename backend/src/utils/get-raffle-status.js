require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Raffle = require('../models/Raffle');

const getRaffleStatus = async () => {
  console.log('Connecting to MongoDB to check raffle statuses...');
  try {
    if (!process.env.MONGO_URI) {
      console.error('ERROR: MONGO_URI is not defined in your .env file.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected. Fetching raffles...');
    const raffles = await Raffle.find({}, 'title status createdAt');

    if (raffles.length === 0) {
      console.log('\n--- No raffles found in the database. ---');
    } else {
      console.log(`\n--- Found ${raffles.length} raffle(s) in the database: ---\n`);
      const statusCounts = {};
      raffles.forEach(raffle => {
        console.log(`- Title: ${raffle.title}`);
        console.log(`  Status: ${raffle.status}`);
        console.log(`  Created: ${raffle.createdAt.toDateString()}`);
        console.log('--------------------');
        statusCounts[raffle.status] = (statusCounts[raffle.status] || 0) + 1;
      });

      console.log('\n--- Status Summary ---');
      Object.keys(statusCounts).forEach(status => {
        console.log(`'${status}': ${statusCounts[status]} raffle(s)`);
      });
      console.log('--------------------\n');
      console.log('Reminder: The homepage displays raffles with status \'active\' or \'completed\'.');
    }

  } catch (error) {
    console.error('\n--- An error occurred ---');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB disconnected. Script finished.');
  }
};

getRaffleStatus();
