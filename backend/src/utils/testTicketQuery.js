require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
// We need this require even if we don't use it directly
// to register the model with Mongoose for population
require('../models/Raffle');

/**
 * Utility to test if a ticket number exists in the database
 */
async function findTicket(ticketNumber) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Search for the ticket
    console.log(`Searching for ticket: ${ticketNumber}`);
    
    // First, try to find it in transactions
    const transaction = await Transaction.findOne({ 'tickets.number': ticketNumber }).populate('raffle');
    
    if (transaction) {
      console.log('✅ Ticket found in a transaction!');
      console.log('Transaction ID:', transaction._id);
      console.log('Raffle:', transaction.raffle ? transaction.raffle.name : 'Unknown raffle');
      console.log('Buyer:', transaction.participantInfo ? `${transaction.participantInfo.name} ${transaction.participantInfo.lastName}` : 'Unknown buyer');
      
      // Find the specific ticket
      const ticket = transaction.tickets.find(t => t.number === ticketNumber);
      if (ticket) {
        console.log('Ticket details:', ticket);
      } else {
        console.log('⚠️ Ticket number exists in the transaction but specific ticket not found');
      }
    } else {
      console.log('❌ Ticket not found in any transaction');
      
      // Check all transactions to see if there's a structure issue
      console.log('\nChecking first 5 transactions for structure issues:');
      const sampleTransactions = await Transaction.find().limit(5);
      
      if (sampleTransactions.length === 0) {
        console.log('No transactions found in the database!');
      } else {
        sampleTransactions.forEach((tx, i) => {
          console.log(`\n[Transaction ${i+1}]`);
          console.log('ID:', tx._id);
          console.log('Has tickets array?', Array.isArray(tx.tickets));
          console.log('Number of tickets:', tx.tickets ? tx.tickets.length : 0);
          if (tx.tickets && tx.tickets.length > 0) {
            console.log('First ticket structure:', JSON.stringify(tx.tickets[0]));
          }
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Get ticket number from command line argument
const ticketNumber = process.argv[2];

if (!ticketNumber) {
  console.log('Please provide a ticket number as an argument');
  console.log('Example: node testTicketQuery.js 12345');
  process.exit(1);
}

findTicket(ticketNumber);
