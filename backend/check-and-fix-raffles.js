// Script to check and fix raffle statuses in the database
require('dotenv').config();
const mongoose = require('mongoose');
const Raffle = require('./src/models/Raffle.js');

async function checkAndFixRaffles() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all raffles
    const allRaffles = await Raffle.find({});
    console.log(`Found ${allRaffles.length} total raffles`);

    // Check for active raffles
    const activeRaffles = await Raffle.find({ status: 'active' });
    console.log(`Found ${activeRaffles.length} active raffles`);
    
    // Check for completed raffles
    const completedRaffles = await Raffle.find({ status: 'completed' });
    console.log(`Found ${completedRaffles.length} completed raffles`);

    // Print details of all raffles
    console.log('\nAll Raffles:');
    allRaffles.forEach(raffle => {
      console.log(`ID: ${raffle._id}, Name: ${raffle.name}, Status: ${raffle.status}`);
    });

    // Ask if we should fix any issues
    console.log('\nWould you like to set a raffle as active? (y/n)');
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase();
      if (answer === 'y') {
        // If there are no active raffles, set the first one to active
        if (activeRaffles.length === 0 && allRaffles.length > 0) {
          const raffleToUpdate = allRaffles[0];
          console.log(`Setting raffle "${raffleToUpdate.name}" to active...`);
          
          raffleToUpdate.status = 'active';
          await raffleToUpdate.save();
          console.log('Raffle updated successfully!');
        } else {
          console.log('Please enter the ID of the raffle you want to set as active:');
          process.stdin.once('data', async (idData) => {
            const raffleId = idData.toString().trim();
            try {
              const raffleToUpdate = await Raffle.findById(raffleId);
              if (raffleToUpdate) {
                raffleToUpdate.status = 'active';
                await raffleToUpdate.save();
                console.log(`Raffle "${raffleToUpdate.name}" set to active successfully!`);
              } else {
                console.log('Raffle not found with that ID.');
              }
            } catch (error) {
              console.error('Error updating raffle:', error);
            } finally {
              mongoose.disconnect();
              process.exit(0);
            }
          });
        }
      } else {
        console.log('No changes made.');
        mongoose.disconnect();
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

checkAndFixRaffles();
