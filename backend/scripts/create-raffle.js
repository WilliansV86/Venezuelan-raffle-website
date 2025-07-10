const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Raffle = require('../src/models/Raffle');

const createRaffle = async () => {
  try {
    await connectDB();

    console.log('Attempting to create a new raffle...');

    // Define the new raffle data
    const newRaffleData = {
      title: 'Gran Rifa de Verano',
      description: 'Participa para ganar un increíble premio de verano. ¡No te lo pierdas!',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1625587200/summer_raffle.jpg',
      ticketPrice: 2, // USD
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
      drawDate: new Date(new Date().setDate(new Date().getDate() + 31)), // 31 days from now
      maxTickets: 5000,
      prize: 'Viaje a la Playa para 2 Personas',
      status: 'active' // Set to active so it can be used immediately
    };

    const newRaffle = await Raffle.create(newRaffleData);

    console.log('--- Raffle Created Successfully! ---');
    console.log(`ID: ${newRaffle._id}`);
    console.log(`Title: "${newRaffle.title}"`);
    console.log(`Status: "${newRaffle.status}"`);
    console.log('------------------------------------');

  } catch (error) {
    console.error('An error occurred while creating the raffle:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

createRaffle();
