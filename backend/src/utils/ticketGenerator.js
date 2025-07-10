/**
 * Utility for generating and managing raffle tickets
 * 
 * Updated to support four-digit non-sequential ticket system
 * Tickets from 0001 to 9999
 */

const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Raffle = require('../models/Raffle');
const NonSequentialTicketManager = require('./nonSequentialTicketManager');

/**
 * Generate all tickets for a raffle
 * @param {string} raffleId - MongoDB ID of the raffle
 * @returns {Promise<Array>} - Array of created ticket IDs
 */
const generateTicketsForRaffle = async (raffleId) => {
  try {
    const raffle = await Raffle.findById(raffleId);
    
    if (!raffle) {
      throw new Error(`Raffle with ID ${raffleId} not found`);
    }
    
    console.log(`Generating ${raffle.maxTickets} tickets for raffle: ${raffle.title}`);
    
    // Create a set of all possible 4-digit numbers (0000-9999)
    const allPossibleNumbers = new Set();
    for (let i = 0; i < 10000; i++) {
      allPossibleNumbers.add(String(i).padStart(4, '0'));
    }
    
    // Convert to array and shuffle for randomness
    const allNumbersArray = Array.from(allPossibleNumbers);
    for (let i = allNumbersArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNumbersArray[i], allNumbersArray[j]] = [allNumbersArray[j], allNumbersArray[i]];
    }
    
    // Take only the number of tickets needed
    const selectedNumbers = allNumbersArray.slice(0, raffle.maxTickets);
    
    // Create tickets in batches
    const batchSize = 1000;
    const totalTickets = Math.min(raffle.maxTickets, selectedNumbers.length);
    const batches = Math.ceil(totalTickets / batchSize);
    
    let ticketCount = 0;
    
    for (let batch = 0; batch < batches; batch++) {
      const ticketsToCreate = [];
      const start = batch * batchSize;
      const end = Math.min(start + batchSize, totalTickets);
      
      for (let i = start; i < end; i++) {
        ticketsToCreate.push({
          number: selectedNumbers[i],
          raffle: raffleId,
          isAssigned: false
        });
      }
      
      const result = await Ticket.insertMany(ticketsToCreate, { ordered: false });
      ticketCount += result.length;
      console.log(`Batch ${batch + 1}/${batches} completed: ${result.length} tickets created`);
    }
    
    console.log(`Successfully generated ${ticketCount} tickets for raffle: ${raffle.title}`);
    return ticketCount;
  } catch (error) {
    console.error('Error generating tickets:', error);
    throw error;
  }
};

/**
 * Assign random non-sequential tickets to a transaction
 * @param {string} raffleId - MongoDB ID of the raffle
 * @param {number} count - Number of tickets to assign
 * @param {string} participantId - MongoDB ID of the participant
 * @param {string} transactionId - MongoDB ID of the transaction
 * @returns {Promise<Array>} - Array of assigned ticket objects
 */
const assignRandomTickets = async (raffleId, count, participantId, transactionId) => {
  try {
    console.log(`Assigning ${count} non-sequential tickets for raffle ${raffleId}`);
    const now = new Date();

    // Get the raffle to check for sold tickets and available tickets
    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      throw new Error(`Raffle with ID ${raffleId} not found`);
    }
    
    // Check if there are enough tickets available
    if (raffle.availableTickets < count) {
      throw new Error(`Requested ${count} tickets, but only ${raffle.availableTickets} are available.`);
    }
    
    // Get the list of already sold tickets
    const soldTickets = raffle.soldTickets || [];
    console.log(`Current sold tickets count: ${soldTickets.length}`);

    // Generate non-sequential ticket numbers using our special manager
    const nonSequentialTicketNumbers = NonSequentialTicketManager.generateNonSequentialTickets(
      count,
      soldTickets,
      1, // min (0001)
      9999 // max (9999)
    );
    
    console.log(`Generated ${nonSequentialTicketNumbers.length} non-sequential tickets: ${nonSequentialTicketNumbers.join(', ')}`);
    
    // Create ticket objects
    const ticketsToCreate = [];
    const ticketObjects = [];
    
    for (const number of nonSequentialTicketNumbers) {
      const ticketObject = new Ticket({
        number,
        raffle: raffleId,
        isAssigned: true,
        participant: participantId,
        transaction: transactionId,
        assignedAt: now
      });
      
      ticketsToCreate.push(ticketObject);
      ticketObjects.push(ticketObject);
    }
    
    // Save all tickets
    await Ticket.insertMany(ticketsToCreate);
    
    // Update the raffle with new sold tickets
    const updatedRaffle = NonSequentialTicketManager.updateRaffleWithSoldTickets(
      raffle, 
      nonSequentialTicketNumbers
    );
    
    // Save the updated raffle
    await Raffle.findByIdAndUpdate(raffleId, {
      soldTickets: updatedRaffle.soldTickets,
      availableTickets: updatedRaffle.availableTickets,
      percentageSold: updatedRaffle.percentageSold
    });
    
    console.log(`Successfully assigned ${count} non-sequential tickets`);
    console.log(`Updated raffle: ${updatedRaffle.availableTickets} tickets available, ${updatedRaffle.percentageSold}% sold`);
    
    return ticketObjects;
  } catch (error) {
    console.error('Error assigning non-sequential tickets:', error);
    throw error;
  }
};

module.exports = {
  generateTicketsForRaffle,
  assignRandomTickets
};
