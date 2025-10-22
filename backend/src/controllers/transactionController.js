const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Raffle = require('../models/Raffle');
const { sendBrevoEmail: sendEmail } = require('../utils/brevoService');
const { generateApprovalEmail } = require('../utils/emailTemplates');
const { uploadToCloudinary } = require('../utils/cloudinaryConfig');
const fs = require('fs');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Admin
const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({}).populate('raffle', 'name').sort({ createdAt: -1 });
  res.json({ success: true, count: transactions.length, data: transactions });
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Public
const createTransaction = asyncHandler(async (req, res) => {
  const {
    raffle: raffleId,
    name,
    lastName,
    email,
    cedula,
    whatsapp,
    paymentMethod,
    paymentReference,
    totalAmount,
  } = req.body;

  let paymentScreenshot = null;
  
  if (!raffleId || !name || !lastName || !email || !cedula || !whatsapp || !paymentMethod || !totalAmount) {
    res.status(400);
    throw new Error('Por favor, complete todos los campos requeridos.');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('El capture del pago es requerido.');
  }
  
  // Upload the file to Cloudinary
  try {
    const result = await uploadToCloudinary(req.file.path, {
      folder: 'payment_screenshots',
      resource_type: 'image',
    });
    
    // Set payment screenshot to the Cloudinary URL
    paymentScreenshot = result.secure_url;
    
    // Delete the local file after upload
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500);
    throw new Error('Error al subir la imagen del comprobante. Por favor, intenta nuevamente.');
  }

  const raffle = await Raffle.findById(raffleId);
  if (!raffle) {
    res.status(404);
    throw new Error('Sorteo no encontrado');
  }

  const transaction = new Transaction({
    raffle: raffleId,
    participantInfo: { name, lastName, email, cedula, whatsapp },
    tickets: [],
    paymentMethod,
    paymentReference,
    paymentScreenshot,
    totalAmount,
    status: 'pending',
  });

  const createdTransaction = await transaction.save();
  res.status(201).json({ success: true, data: createdTransaction });
});

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private/Admin
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id).populate('raffle', 'name number');

  if (transaction) {
    res.json({ success: true, data: transaction });
  } else {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }
});

// @desc    Update transaction status
// @route   PUT /api/transactions/:id/status
// @access  Private/Admin
const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  console.log(`Starting transaction status update to: ${status} for ID: ${req.params.id}`);
  
  const transaction = await Transaction.findById(req.params.id).populate('raffle');

  if (!transaction) {
    console.error(`Transaction not found with ID: ${req.params.id}`);
    res.status(404);
    throw new Error('Transacción no encontrada');
  }

  // Update the status
  transaction.status = status;

  // If the transaction is approved, generate tickets and send confirmation email
  if (status === 'approved') {
    console.log(`Processing APPROVED transaction: ${transaction._id}`);
    
    // Generate tickets only if they don't exist
    if (transaction.tickets.length === 0) {
      console.log('No tickets found, starting ticket generation process...');
      
      // Validate raffle price
      const ticketPrice = transaction.raffle?.price;
      if (!ticketPrice || ticketPrice <= 0) {
        console.error(`Invalid ticket price for raffle: ${transaction.raffle?._id}`);
        throw new Error('Precio de ticket inválido para esta rifa.');
      }
      
      // Calculate number of tickets based on paid amount
      const numberOfTickets = Math.floor(transaction.totalAmount / ticketPrice);
      console.log(`Generating ${numberOfTickets} tickets based on payment of ${transaction.totalAmount}`);
      
      // Get existing ticket numbers to avoid duplicates
      const existingTicketNumbersArr = await Transaction.distinct('tickets.number', { raffle: transaction.raffle._id });
      const existingTicketNumbers = new Set(existingTicketNumbersArr);
      console.log(`Found ${existingTicketNumbers.size} existing tickets to avoid duplicates`);
      
      // Generate unique ticket numbers
      const generatedTickets = [];
      for (let i = 0; i < numberOfTickets; i++) {
        let newTicketNumber;
        do {
          newTicketNumber = Math.floor(1000 + Math.random() * 9000).toString();
        } while (existingTicketNumbers.has(newTicketNumber));
        
        existingTicketNumbers.add(newTicketNumber);
        generatedTickets.push({ number: newTicketNumber });
      }

      transaction.tickets = generatedTickets;
      console.log(`Successfully generated ${generatedTickets.length} unique tickets`);

      // Save transaction with generated tickets before sending email
      await transaction.save();
      console.log('Transaction saved with newly generated tickets');
      
      // Prepare and send the confirmation email
      const ticketNumbers = transaction.tickets.map(t => t.number).join(', ');
      const recipientName = transaction.participantInfo?.name || 'Estimado Cliente';
      const recipientEmail = transaction.participantInfo?.email;
      
      console.log(`Preparing email for ${recipientEmail} with tickets: ${ticketNumbers}`);
      
      // Use the new modern email template
      const userName = transaction.customerName || 'Estimado Cliente';
      const raffleName = transaction.raffle?.name || 'Rifa';
      const emailContent = generateApprovalEmail(userName, raffleName, transaction.tickets);

      try {
        // Send the email
        if (recipientEmail) {
          const raffleName = transaction.raffle?.name || 'Rifa';
          const emailContent = generateApprovalEmail(userName, raffleName, transaction.tickets);
          
          await sendEmail({
            to: recipientEmail,
            subject: `Confirmación de Compra - Rifa "${raffleName}"`,
            html: emailContent,
          });
          console.log(`✓ Confirmation email successfully sent to ${recipientEmail}`);
        } else {
          console.error('Cannot send email: Recipient email is missing');
        }
      } catch (emailError) {
        console.error(`Failed to send confirmation email to ${recipientEmail}:`);
        console.error(emailError);
        // We don't throw the error here to allow the transaction status update to complete
        // The ticket numbers are already saved in the database
      }
    } else {
      console.log(`Tickets already exist (${transaction.tickets.length}) for this transaction, skipping generation.`);
      
      // Even if tickets exist, we should still send an email
      // This handles cases where the email might have failed to send previously
      try {
        const ticketNumbers = transaction.tickets.map(t => t.number).join(', ');
        const recipientName = transaction.participantInfo?.name || 'Estimado Cliente';
        const recipientEmail = transaction.participantInfo?.email;
        
        if (recipientEmail) {
          // Use the new modern email template for existing tickets too
          const userName = recipientName;
          const raffleName = transaction.raffle?.name || 'Rifa';
          const ticketsList = transaction.tickets.map(t => t.number);
          const emailContent = generateApprovalEmail(userName, raffleName, ticketsList);
          
          await sendEmail({
            to: recipientEmail,
            subject: `Confirmación de Compra - Rifa "${transaction.raffle?.name || 'Rifa'}"`,
            html: emailContent,
          });
          console.log(`✓ Confirmation email sent for existing tickets to ${recipientEmail}`);
        }
      } catch (emailError) {
        console.error('Failed to send email for existing tickets:', emailError);
      }
    }
  }

  // Save the final transaction state
  const updatedTransaction = await transaction.save();
  console.log(`Transaction ${updatedTransaction._id} successfully updated to status: ${updatedTransaction.status}`);
  
  res.json({ success: true, data: updatedTransaction });
});

// @desc    Confirm a transaction and generate tickets
// @route   PUT /api/transactions/:id/confirm
// @access  Private/Admin
const confirmTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (transaction) {
    transaction.status = 'completed';
    // Future logic to generate tickets can be added here
    const updatedTransaction = await transaction.save();
    res.json({ success: true, data: updatedTransaction });
  } else {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }
});

module.exports = {
  getAllTransactions,
  createTransaction,
  getTransactionById,
  updateTransactionStatus,
  confirmTransaction,
};
