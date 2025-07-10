const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Raffle = require('../src/models/Raffle');
const Ticket = require('../src/models/Ticket');
const { generateTicketsForRaffle } = require('../src/utils/ticketGenerator');

const regenerate = async () => {
  try {
    await connectDB();

    // 1. Find the first active raffle
    const activeRaffle = await Raffle.findOne({ status: 'active' });

    if (!activeRaffle) {
      console.log('No active raffle found. Exiting.');
      return;
    }

    const raffleId = activeRaffle._id;
    console.log(`Found active raffle: "${activeRaffle.title}" (ID: ${raffleId})`);

    // 2. Delete all existing tickets for this raffle
    console.log('Deleting old tickets...');
    const { deletedCount } = await Ticket.deleteMany({ raffle: raffleId });
    console.log(`Deleted ${deletedCount} old tickets.`);

    // 3. Reset the ticketsSold count on the raffle
    activeRaffle.ticketsSold = 0;
    await activeRaffle.save();
    console.log('Reset ticketsSold count on the raffle.');

    // 4. Regenerate all tickets correctly
    console.log('Regenerating tickets with correct 4-digit format...');
    const newTicketCount = await generateTicketsForRaffle(raffleId);
    console.log(`Successfully regenerated ${newTicketCount} new tickets.`);

    console.log('\nData migration complete! The raffle is now ready with clean data.');

  } catch (error) {
    console.error('An error occurred during ticket regeneration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
};

regenerate();
