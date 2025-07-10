const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Raffle = require('../src/models/Raffle');

const listRaffles = async () => {
  try {
    await connectDB();

    console.log('Fetching all raffles from the database...');
    const raffles = await Raffle.find({}, 'title status');

    if (raffles.length === 0) {
      console.log('No raffles found in the database.');
    } else {
      console.log('Found the following raffles:');
      raffles.forEach(raffle => {
        console.log(`- Title: "${raffle.title}", Status: "${raffle.status}"`);
      });
    }

  } catch (error) {
    console.error('An error occurred while fetching raffles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

listRaffles();
