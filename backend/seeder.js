const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Raffle = require('./src/models/Raffle');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const sampleRaffles = [
  {
    name: 'Gran Sorteo de Moto 0KM',
    description: 'Participa en el sorteo de una moto Empire Horse 0KM. ¡No te pierdas esta oportunidad única!',
    image: 'https://i.imgur.com/R3cK9d3.png', // Using a valid placeholder image
    ticketPrice: 5,
    drawDate: new Date('2025-12-31T20:00:00'),
    isActive: true,
  },
];

const importData = async () => {
  try {
    await Raffle.deleteMany();
    await Raffle.insertMany(sampleRaffles);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Raffle.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
