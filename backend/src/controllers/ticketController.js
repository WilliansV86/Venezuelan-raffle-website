const asyncHandler = require('express-async-handler');
const Raffle = require('../models/Raffle');
const Transaction = require('../models/Transaction');
const multer = require('multer');
const path = require('path');

// Configure multer storage for payment proofs
// Configure multer storage for payment proofs
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/payment-proofs');

// A function to ensure the upload directory exists.
// This is safer than running fs.mkdirSync at the top level of the module.
const ensureUploadDirExists = () => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Upload directory created at: ${uploadDir}`);
    }
  } catch (error) {
    console.error(`CRITICAL ERROR: Could not create upload directory at ${uploadDir}.`);
    console.error('Please check file permissions. Full error:', error);
    // Exit gracefully if we can't create the directory, as uploads will fail.
    process.exit(1);
  }
};

// Call the function to make sure the directory is ready.
ensureUploadDirExists();

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
  try {
    console.log('Purchase endpoint hit at', new Date().toISOString());
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const {
      firstName,
      lastName,
      email,
      identificationNumber,
      whatsappNumber,
      paymentReference,
      quantity,
      paymentMethod,
      raffleId,
      totalAmount
    } = req.body;

    if (!firstName || !lastName || !email || !identificationNumber || !whatsappNumber || !quantity || !paymentMethod || !raffleId || !totalAmount) {
      return res.status(400).json({ success: false, error: 'Por favor complete todos los campos requeridos' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'El comprobante de pago es requerido' });
    }

    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).json({ success: false, error: 'Sorteo no encontrado' });
    }

    if (raffle.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Este sorteo ya no está activo' });
    }

    if (parseInt(quantity) > raffle.ticketsAvailable) {
      return res.status(400).json({ success: false, error: `Solo quedan ${raffle.ticketsAvailable} tickets disponibles` });
    }

    const allExistingTickets = raffle.tickets.map(ticket => ticket.ticketNumber);
    const newTicketNumbers = generateUniqueTickets(parseInt(quantity), allExistingTickets);

    const newTransaction = new Transaction({
      raffle: raffleId,
      participantInfo: {
        name: firstName,
        lastName: lastName,
        email: email,
        cedula: identificationNumber,
        whatsapp: whatsappNumber,
      },
      tickets: newTicketNumbers.map(num => ({ number: num })),
      paymentMethod,
      paymentReference,
      paymentScreenshot: req.file.path,
      totalAmount: parseFloat(totalAmount),
      status: 'pending', // Set as pending for admin review
    });

    console.log('--- PREPARING TO SAVE TRANSACTION ---');
    console.log(JSON.stringify(newTransaction, null, 2));

    const savedTransaction = await newTransaction.save();

    console.log('--- TRANSACTION SAVED SUCCESSFULLY ---');
    console.log(JSON.stringify(savedTransaction, null, 2));

    const ticketsToAddToRaffle = newTicketNumbers.map(number => ({
      ticketNumber: number,
      owner: {
        name: `${firstName} ${lastName}`,
        phone: whatsappNumber,
      },
      paid: true, // The transaction is created, so the ticket is considered paid
      paymentReference: savedTransaction._id, // Link to the transaction for verification
    }));

    raffle.tickets.push(...ticketsToAddToRaffle);
    raffle.ticketsSold += parseInt(quantity);
    await raffle.save();

    console.log('--- RAFFLE UPDATED WITH NEW TICKETS ---');

    res.status(201).json({
      success: true,
      message: 'Compra realizada con éxito',
      tickets: newTicketNumbers
    });
  } catch (error) {


    console.error('---------------------------------------');
    console.error('ERROR in purchaseTickets:', error);
    console.error('Stack trace:', error.stack);
    console.error('---------------------------------------');
    
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
    return res.status(400).json({ success: false, error: 'Número de ticket e identificación son requeridos' });
  }

  // Find the raffle that contains this ticket number
  const raffle = await Raffle.findOne({ 'tickets.ticketNumber': ticketNumber });

  if (!raffle) {
    return res.status(404).json({ success: false, error: 'Ticket no encontrado' });
  }

  // Find the specific ticket in the raffle
  const ticket = raffle.tickets.find(t => t.ticketNumber === ticketNumber);

  // Find the transaction associated with the ticket to verify the owner
  const transaction = await Transaction.findOne({
    raffle: raffle._id,
    'tickets.number': ticketNumber,
    'participantInfo.cedula': identificationNumber
  });

  if (ticket && transaction) {
    return res.json({
      success: true,
      ticket: {
        number: ticket.ticketNumber,
        buyer: {
          firstName: transaction.participantInfo.name,
          lastName: transaction.participantInfo.lastName,
          identificationNumber: transaction.participantInfo.cedula
        }
      },
      raffle: {
        name: raffle.name,
        date: raffle.drawDate,
        status: raffle.status
      }
    });
  } else {
    return res.status(403).json({ success: false, error: 'El número de identificación no coincide con el dueño del ticket' });
  }
});

const initializeTicketController = async () => {
  try {
    // Create the directory for storing payment screenshots if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
  } catch (error) {
    console.error('Error initializing ticket controller:', error);
  }
};

// @desc    Verify tickets by cedula/identification number
// @route   GET /api/tickets/verify/:cedula
// @access  Public
const verifyTicketsByCedula = asyncHandler(async (req, res) => {
  const { cedula } = req.params;

  if (!cedula) {
    return res.status(400).json({ success: false, message: 'Número de cédula es requerido' });
  }

  try {
    // Normalize cedula format to handle both with and without prefix
    let normalizedCedula = cedula;
    // If it has format V-12345678, try both with and without the prefix
    const withPrefixFormat = /^[VE]-\d+$/;
    
    // Find all transactions with this cedula (handling both formats)
    const transactions = await Transaction.find({
      $or: [
        { 'participantInfo.cedula': cedula },
        // If cedula has V- format, also search without it
        ...(withPrefixFormat.test(cedula) ? 
          [{ 'participantInfo.cedula': cedula.substring(2) }] : 
          []),
        // If cedula is just digits, also search with V- prefix
        ...(/^\d+$/.test(cedula) ? 
          [{ 'participantInfo.cedula': `V-${cedula}` }, { 'participantInfo.cedula': `E-${cedula}` }] : 
          [])
      ]
    }).populate('raffle');

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ success: false, message: 'No se encontraron boletos para esta cédula' });
    }

    // Format response
    const participant = {
      name: transactions[0].participantInfo.name,
      cedula: transactions[0].participantInfo.cedula,
      email: transactions[0].participantInfo.email
    };

    const tickets = [];

    // Process each transaction
    for (const transaction of transactions) {
      if (!transaction.raffle) {
        continue; // Skip if raffle not found
      }

      // Add each ticket from the transaction
      for (const ticket of transaction.tickets) {
        tickets.push({
          id: ticket._id || `ticket-${Math.random().toString(36).substr(2, 9)}`,
          ticketNumber: ticket.number,
          raffleName: transaction.raffle.name,
          rafflePrize: transaction.raffle.prizeName || 'Premio no especificado',
          purchaseDate: transaction.createdAt,
          paymentStatus: transaction.status,
          isActive: transaction.raffle.status === 'active',
          isWinner: ticket.isWinner || false
        });
      }
    }

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
});

module.exports = {
  purchaseTickets,
  verifyTicket,
  verifyTicketsByCedula,
  storage,
  initializeTicketController
};
