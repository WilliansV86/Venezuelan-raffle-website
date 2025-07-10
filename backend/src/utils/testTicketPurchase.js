/**
 * Test script for verifying the ticket purchase flow
 * Tests random 4-digit ticket generation and minimum purchase validation
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Participant = require('../models/Participant');
const Transaction = require('../models/Transaction');
const Raffle = require('../models/Raffle');
const ticketGenerator = require('./ticketGenerator');
const emailService = require('./emailService');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Test ticket purchase with random numbers
const testTicketPurchase = async () => {
  try {
    console.log('\n--- TESTING TICKET PURCHASE FLOW ---\n');
    
    // Get active raffle
    console.log('Finding active raffle...');
    const raffle = await Raffle.findOne({ status: 'active' });
    
    if (!raffle) {
      console.error('No active raffle found!');
      return;
    }
    
    console.log(`Found active raffle: ${raffle.name}`);
    
    // Create test participant
    const testEmail = `test_${Date.now()}@example.com`;
    let participant = await Participant.findOne({ email: testEmail });
    
    if (!participant) {
      console.log('Creating test participant...');
      participant = await Participant.create({
        fullName: 'Test User',
        email: testEmail,
        whatsappNumber: '+12345678901',
        identificationNumber: 'V-12345678'
      });
    }
    
    console.log(`Test participant ID: ${participant._id}`);
    
    // Test 1: Test with 5 tickets (should work for regular payment methods)
    console.log('\nTEST 1: Purchase 5 tickets with regular payment');
    await testPurchase(raffle, participant, 5, 'pago-movil');
    
    // Test 2: Test with 5 tickets using Zelle (should fail due to minimum 10 requirement)
    console.log('\nTEST 2: Purchase 5 tickets with Zelle (should fail)');
    await testPurchase(raffle, participant, 5, 'zelle');
    
    // Test 3: Test with 10 tickets using Zelle (should succeed)
    console.log('\nTEST 3: Purchase 10 tickets with Zelle (should succeed)');
    await testPurchase(raffle, participant, 10, 'zelle');
    
    // Test 4: Test with 10 tickets using Binance (should succeed)
    console.log('\nTEST 4: Purchase 10 tickets with Binance (should succeed)');
    await testPurchase(raffle, participant, 10, 'binance');
    
    // Test 5: Verify random, non-sequential 4-digit ticket numbers
    console.log('\nTEST 5: Verify random 4-digit ticket numbers');
    const testParticipant = await Participant.findById(participant._id)
      .populate('tickets');
    
    if (testParticipant.tickets && testParticipant.tickets.length > 0) {
      const ticketNumbers = testParticipant.tickets.map(ticket => ticket.number);
      console.log('Generated ticket numbers:');
      console.log(ticketNumbers);
      
      // Verify format: 4 digits with leading zeros
      const validFormat = ticketNumbers.every(num => /^\d{4}$/.test(num));
      console.log(`All tickets have valid 4-digit format: ${validFormat ? '✅ YES' : '❌ NO'}`);
      
      // Check for duplicates
      const uniqueNumbers = new Set(ticketNumbers);
      console.log(`All tickets are unique: ${uniqueNumbers.size === ticketNumbers.length ? '✅ YES' : '❌ NO'}`);
    } else {
      console.log('No tickets found for test participant');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Helper function to test a purchase
async function testPurchase(raffle, participant, ticketCount, paymentMethod) {
  try {
    // Generate test ticket numbers
    const ticketNumbers = [];
    const allTickets = await Ticket.find({ raffle: raffle._id }).select('number');
    const takenNumbers = new Set(allTickets.map(ticket => ticket.number));
    
    // Check if minimum ticket count requirement is met
    const minTicketsRequired = raffle.minTicketsPerPurchase?.[paymentMethod] || 
      (paymentMethod === 'zelle' || paymentMethod === 'binance' ? 10 : 1);
    
    if (ticketCount < minTicketsRequired) {
      console.log(`❌ ERROR: Minimum ${minTicketsRequired} tickets required for ${paymentMethod}`);
      return false;
    }
    
    // Generate random 4-digit ticket numbers
    for (let i = 0; i < ticketCount; i++) {
      let randomNum;
      do {
        randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      } while (takenNumbers.has(randomNum) || ticketNumbers.includes(randomNum));
      
      ticketNumbers.push(randomNum);
      takenNumbers.add(randomNum);
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      participant: participant._id,
      raffle: raffle._id,
      paymentAmount: ticketCount * raffle.ticketPrice,
      paymentMethod,
      paymentReference: `TEST-${Date.now()}`,
      paymentProof: 'test/path/to/proof.jpg',
      ticketCount,
      ticketPrice: raffle.ticketPrice,
      status: 'confirmed',
    });
    
    console.log(`Created transaction ID: ${transaction._id}`);
    
    // Assign tickets using the updated ticketGenerator
    console.log(`Assigning ${ticketCount} tickets with numbers:`, ticketNumbers);
    const assignedTickets = await ticketGenerator.assignRandomTickets(
      raffle._id,
      ticketCount,
      participant._id,
      transaction._id,
      ticketNumbers
    );
    
    // Update transaction with assigned tickets
    transaction.tickets = assignedTickets.map(ticket => ticket._id);
    await transaction.save();
    
    // Update participant
    const updatedParticipant = await Participant.findById(participant._id);
    updatedParticipant.tickets = [...(updatedParticipant.tickets || []), ...assignedTickets.map(ticket => ticket._id)];
    updatedParticipant.participations = [...(updatedParticipant.participations || []), transaction._id];
    await updatedParticipant.save();
    
    console.log(`✅ Successfully purchased ${ticketCount} tickets with ${paymentMethod}`);
    
    // Test email service (in dev mode)
    if (process.env.EMAIL_DEV_MODE === 'true') {
      console.log('Testing email service (dev mode)...');
      await emailService.sendConfirmationEmail(
        transaction,
        participant,
        raffle,
        ticketNumbers
      );
      console.log('Email logged to file in development mode');
    }
    
    return true;
  } catch (error) {
    console.error(`Purchase test failed for ${paymentMethod}:`, error);
    return false;
  }
}

// Run the test
const runTest = async () => {
  const conn = await connectDB();
  await testTicketPurchase();
  console.log('\n--- TEST COMPLETED ---\n');
  await mongoose.connection.close();
  process.exit(0);
};

runTest();
