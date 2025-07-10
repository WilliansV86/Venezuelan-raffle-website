const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Participant = require('../models/Participant');
const Raffle = require('../models/Raffle');

// GET /api/tickets: List all tickets + status
router.get('/', (req, res) => res.json({ message: 'GET all tickets with status - placeholder' }));

// GET /api/tickets/verify/:cedula - Verify tickets by cedula
router.get('/verify/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Find participant by cedula
    const participant = await Participant.findOne({ cedula });
    
    if (!participant) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontró ningún participante con esta cédula.' 
      });
    }
    
    // Find all tickets belonging to this participant
    const tickets = await Ticket.find({ participant: participant._id })
      .populate({
        path: 'raffle',
        select: 'title prize isActive winningTicketNumber endDate'
      });
    
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontraron boletos asociados a esta cédula.' 
      });
    }
    
    // Format and return ticket information
    const formattedTickets = tickets.map(ticket => ({
      id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      raffleName: ticket.raffle.title,
      rafflePrize: ticket.raffle.prize,
      isActive: ticket.raffle.isActive,
      purchaseDate: ticket.purchaseDate,
      paymentStatus: ticket.paymentStatus,
      isWinner: !ticket.raffle.isActive && 
                ticket.raffle.winningTicketNumber === ticket.ticketNumber
    }));
    
    return res.status(200).json({
      success: true,
      participant: {
        name: participant.name,
        cedula: participant.cedula,
        email: participant.email
      },
      tickets: formattedTickets
    });
    
  } catch (error) {
    console.error('Error verifying tickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar los boletos. Por favor, intente de nuevo más tarde.',
      error: error.message
    });
  }
});

// GET /api/tickets/available/:raffleId/:count - Check if enough tickets are available
router.get('/available/:raffleId/:count', async (req, res) => {
  try {
    const { raffleId, count } = req.params;
    const ticketCount = parseInt(count);
    
    if (isNaN(ticketCount) || ticketCount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de boletos debe ser un número positivo.'
      });
    }
    
    // Find the raffle
    const raffle = await Raffle.findById(raffleId);
    
    if (!raffle) {
      return res.status(404).json({
        success: false,
        message: 'El sorteo no fue encontrado.'
      });
    }
    
    // Check if the raffle is active
    if (!raffle.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Este sorteo ya ha finalizado.'
      });
    }
    
    // Check if there are enough available tickets
    const availableCount = raffle.availableTickets ? raffle.availableTickets.length : 0;
    
    if (availableCount < ticketCount) {
      return res.status(400).json({
        success: false,
        available: false,
        message: `Lo sentimos, solo quedan ${availableCount} boletos disponibles.`
      });
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      available: true,
      message: `Hay ${availableCount} boletos disponibles.`
    });
    
  } catch (error) {
    console.error('Error checking ticket availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar la disponibilidad de boletos. Por favor, intente de nuevo más tarde.',
      error: error.message
    });
  }
});

module.exports = router;
