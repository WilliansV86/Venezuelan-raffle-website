const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Raffle = require('../models/Raffle'); 

// @desc    Find ticket by number 
// @route   GET /api/tickets/find/:ticketNumber
// @access  Public
router.get('/find/:ticketNumber', asyncHandler(async (req, res) => {
  const { ticketNumber } = req.params;
  const raffleId = req.query.raffleId; // Optional raffle ID to narrow search

  console.log('------- TICKET VERIFICATION REQUEST -------');
  console.log('Ticket Number:', ticketNumber);
  console.log('Raffle ID (optional):', raffleId || 'Not provided');

  if (!ticketNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'Número de ticket es requerido' 
    });
  }

  try {
    // Normalize the ticket number (remove leading zeros, etc.)
    const normalizedTicketNumber = ticketNumber.toString().trim();

    // Build queries to find the transaction containing this ticket
    // Try both with and without leading zeros, and as both string and number
    const queries = [
      { 'tickets.number': normalizedTicketNumber },
      { 'tickets.number': normalizedTicketNumber.padStart(4, '0') }, // Try with padding to 4 digits
      { 'tickets.number': parseInt(normalizedTicketNumber).toString() }, // Try as parsed integer
    ];
    
    // Base query object
    const baseQuery = {};
    
    // If a raffle ID is provided, add it to the base query
    if (raffleId) {
      baseQuery.raffle = raffleId;
    }
    
    // Try each query variation until we find a match
    let transaction = null;
    
    for (const queryVariation of queries.map(q => ({ ...baseQuery, ...q }))) {
      const result = await Transaction.findOne(queryVariation).populate('raffle');
      
      if (result) {
        transaction = result;
        break;
      }
    }

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontró el ticket'
      });
    }

    // Find the ticket in the transaction
    let ticket = transaction.tickets.find(t => t.number === ticketNumber);
    
    // If direct match fails, try case-insensitive match
    if (!ticket) {
      ticket = transaction.tickets.find(t => 
        t.number.toLowerCase() === ticketNumber.toLowerCase()
      );
    }
    
    // If still not found, try numeric match
    if (!ticket) {
      const numericTicket = parseInt(ticketNumber, 10);
      if (!isNaN(numericTicket)) {
        ticket = transaction.tickets.find(t => 
          parseInt(t.number, 10) === numericTicket
        );
      }
    }
    
    if (!ticket && transaction.tickets.length > 0) {
      // If we can't find an exact match but have tickets, use the first one as fallback
      ticket = transaction.tickets[0];
    }

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket no encontrado en la transacción'
      });
    }
    
    // Format response
    res.json({
      success: true,
      ticket: {
        id: ticket._id,
        number: ticket.number,
        buyer: {
          firstName: transaction.participantInfo.name,
          lastName: transaction.participantInfo.lastName,
          identificationNumber: transaction.participantInfo.cedula,
          email: transaction.participantInfo.email,
          whatsapp: transaction.participantInfo.whatsapp
        },
        purchaseDate: transaction.createdAt,
        status: transaction.status
      },
      raffle: {
        id: transaction.raffle._id,
        name: transaction.raffle.name,
        status: transaction.raffle.status,
        drawDate: transaction.raffle.drawDate || transaction.raffle.endDate,
        prize: transaction.raffle.prize
      }
    });
  } catch (error) {
    console.error('Error finding ticket by number:', error);
    res.status(500).json({
      success: false, 
      message: 'Error al buscar el ticket',
      error: error.message
    });
  }
}));

// @desc    Verify tickets by cedula
// @route   GET /api/tickets/verify/:cedula
// @access  Public
router.get('/verify/:cedula', asyncHandler(async (req, res) => {
  const { cedula } = req.params;

  console.log('------- CEDULA VERIFICATION REQUEST -------');
  console.log('Cedula:', cedula);

  if (!cedula) {
    return res.status(400).json({ 
      success: false, 
      message: 'Número de cédula es requerido' 
    });
  }

  try {
    // Find all transactions with this cedula
    const transactions = await Transaction.find({
      'participantInfo.cedula': cedula
    }).populate('raffle');

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontraron boletos para esta cédula'
      });
    }

    // Format the participant info from the first transaction
    const firstTransaction = transactions[0];
    
    const participant = {
      name: firstTransaction.participantInfo.name,
      lastName: firstTransaction.participantInfo.lastName,
      cedula: firstTransaction.participantInfo.cedula,
      email: firstTransaction.participantInfo.email
    };

    // Format all tickets from all transactions
    const tickets = transactions.flatMap(transaction => {
      const raffleName = transaction.raffle ? transaction.raffle.name : 'Sorteo Desconocido';
      const rafflePrize = transaction.raffle ? transaction.raffle.prize : '';
      const raffleStatus = transaction.raffle ? transaction.raffle.status : 'unknown';
      
      return transaction.tickets.map(ticket => ({
        id: ticket._id.toString(),
        ticketNumber: ticket.number,
        raffleName,
        rafflePrize,
        purchaseDate: transaction.createdAt,
        paymentStatus: transaction.status,
        isWinner: false, // This would need to be determined based on winner data
        isActive: raffleStatus === 'active'
      }));
    });

    res.json({
      success: true,
      participant,
      tickets
    });
  } catch (error) {
    console.error('Error verifying tickets by cedula:', error);
    res.status(500).json({
      success: false, 
      message: 'Error al verificar los boletos',
      error: error.message
    });
  }
}));

module.exports = router;
