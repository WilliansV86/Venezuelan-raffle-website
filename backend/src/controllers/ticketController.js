const asyncHandler = require('express-async-handler');
const Raffle = require('../models/Raffle');
const multer = require('multer');
const path = require('path');

// Configure multer storage for payment proofs
// Configure multer storage for payment proofs
const fs = require('fs');
const uploadDir = path.join(__dirname, '../../uploads/payment-proofs');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'payment-' + uniqueSuffix + ext);
  }
});

// Generate a random 4-digit ticket number
const generateRandomTicketNumber = () => {
  // Generate a random 4-digit number (1000-9999)
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate multiple unique random ticket numbers
const generateUniqueTickets = (quantity, existingTickets) => {
  const uniqueTickets = [];
  const existingTicketsSet = new Set(existingTickets);
  
  // Loop until we have the required number of unique tickets
  while (uniqueTickets.length < quantity) {
    const newTicket = generateRandomTicketNumber();
    
    // Only add if it's not already assigned
    if (!existingTicketsSet.has(newTicket) && !uniqueTickets.includes(newTicket)) {
      uniqueTickets.push(newTicket);
      
      // Ensure tickets are not sequential for the same person
      if (uniqueTickets.length > 1) {
        const lastTicket = uniqueTickets[uniqueTickets.length - 2];
        // If sequential, replace the last added ticket
        if (Math.abs(parseInt(newTicket) - parseInt(lastTicket)) === 1) {
          uniqueTickets.pop();
          continue;
        }
      }
    }
  }
  
  return uniqueTickets;
};

// @desc    Purchase tickets for a raffle
// @route   POST /api/tickets/purchase
// @access  Public
const purchaseTickets = asyncHandler(async (req, res) => {
  console.log('---------------------------------------');
  console.log('Purchase endpoint hit at', new Date().toISOString());
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request file:', req.file);
  console.log('---------------------------------------');
  try {
    const {
      firstName,
      lastName,
      email,
      identificationNumber,
      whatsappNumber,
      paymentReference,
      quantity,
      paymentMethod,
      raffleId
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !identificationNumber || !whatsappNumber || 
        !paymentReference || !quantity || !paymentMethod || !raffleId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Por favor complete todos los campos requeridos' 
      });
    }

    // For testing, make payment proof optional
    if (!req.file) {
      console.log('Warning: No payment proof file uploaded, but continuing for testing');
    }

    // Find the raffle
    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).json({ 
        success: false, 
        error: 'Sorteo no encontrado' 
      });
    }

    // Check if the raffle is still active
    if (raffle.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        error: 'Este sorteo ya no está activo' 
      });
    }

    // Check if there are enough tickets available
    if (parseInt(quantity) > raffle.ticketsAvailable) {
      return res.status(400).json({ 
        success: false, 
        error: `Solo quedan ${raffle.ticketsAvailable} tickets disponibles` 
      });
    }

    // Get all existing ticket numbers
    const allExistingTickets = raffle.tickets ? raffle.tickets.map(ticket => ticket.ticketNumber) : [];
    console.log('Existing tickets:', allExistingTickets);
    
    // Generate unique tickets
    const newTickets = generateUniqueTickets(parseInt(quantity), allExistingTickets);
    console.log('Generated new tickets:', newTickets);
    
    // Create ticket objects with buyer information
    const ticketsToAdd = newTickets.map(number => ({
      ticketNumber: number,
      owner: {
        name: `${firstName} ${lastName}`,
        phone: whatsappNumber
      },
      paid: true,
      paymentReference: paymentReference
    }));
    
    console.log('Tickets to add:', ticketsToAdd);
    
    // Initialize tickets array if it doesn't exist
    if (!raffle.tickets) {
      raffle.tickets = [];
    }
    
    // Add new tickets to the raffle
    raffle.tickets.push(...ticketsToAdd);
    
    // Update ticketsSold count
    raffle.ticketsSold += parseInt(quantity);
    
    // Save the updated raffle
    await raffle.save();
    
    // Return success response with the ticket numbers
    res.status(201).json({
      success: true,
      message: 'Compra realizada con éxito',
      tickets: newTickets,
      raffle: {
        name: raffle.name,
        ticketsAvailable: raffle.ticketsAvailable
      }
    });
  } catch (error) {
    console.error('---------------------------------------');
    console.error('ERROR in purchaseTickets:', error);
    console.error('Stack trace:', error.stack);
    console.error('---------------------------------------');
    
    // Send a more detailed error response for debugging
    res.status(500).json({
      success: false,
      error: 'Error al procesar la compra de tickets',
      details: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// @desc    Verify a ticket by number and ID
// @route   POST /api/tickets/verify
// @access  Public
const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketNumber, identificationNumber } = req.body;
  
  if (!ticketNumber || !identificationNumber) {
    return res.status(400).json({
      success: false,
      error: 'Número de ticket e identificación son requeridos'
    });
  }
  
  // Find raffles that have this ticket number
  const raffles = await Raffle.find({
    'ticketsSold.number': ticketNumber
  });
  
  if (raffles.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Ticket no encontrado'
    });
  }
  
  // Check each raffle to find the ticket and verify owner
  for (const raffle of raffles) {
    const ticket = raffle.ticketsSold.find(t => t.number === ticketNumber);
    
    if (ticket && ticket.buyer.identificationNumber === identificationNumber) {
      return res.json({
        success: true,
        ticket: {
          number: ticket.number,
          buyer: {
            firstName: ticket.buyer.firstName,
            lastName: ticket.buyer.lastName,
            identificationNumber: ticket.buyer.identificationNumber
          }
        },
        raffle: {
          name: raffle.name,
          date: raffle.drawDate,
          status: raffle.status
        }
      });
    }
  }
  
  // If we get here, the identification number doesn't match
  return res.status(403).json({
    success: false,
    error: 'El número de identificación no coincide con el dueño del ticket'
  });
});

module.exports = {
  purchaseTickets,
  verifyTicket,
  storage
};
