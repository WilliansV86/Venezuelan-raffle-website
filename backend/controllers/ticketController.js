const Ticket = require('../models/Ticket');
const Raffle = require('../models/Raffle'); // Import Raffle model
const asyncHandler = require('express-async-handler');

// @desc    Get all tickets with status
// @route   GET /api/tickets
// @access  Public (or Admin, depending on requirements)
const getAllTickets = (req, res) => {
  // Logic to fetch all tickets, possibly with filters for raffle, participant, status
  // Populate participant and raffle details
  res.json({ message: 'getAllTickets controller placeholder' });
};

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Public (or Private, depending on authentication)
const createTicket = asyncHandler(async (req, res) => {
  // Assume req.body contains { raffleId, ticketNumber, participantId }
  const { raffleId, ticketNumber, participantId } = req.body;

  // TODO: Validate input (e.g., check if raffle exists, if ticket number is valid and available)

  // TODO: Create the new ticket using Ticket.create()

  // Remove the sold ticket number from the raffle's availableTickets array
  const raffle = await Raffle.findById(raffleId);
  if (!raffle) {
    res.status(404);
    throw new Error('Raffle not found');
  }

  raffle.availableTickets = raffle.availableTickets.filter(t => t !== ticketNumber);
  await raffle.save();

  // TODO: Send response with created ticket details
  res.status(201).json({ message: 'Ticket created and availableTickets updated (placeholder)' });
});

module.exports = {
  getAllTickets,
  createTicket, // Export createTicket
};
