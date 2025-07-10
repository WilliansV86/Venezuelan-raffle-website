const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Participant = require('../models/Participant');
const Raffle = require('../models/Raffle');
const emailService = require('../utils/emailService');

/**
 * Get all transactions
 * @route GET /api/payments
 * @access Private (admin only)
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({})
    .populate('participant', 'fullName email')
    .populate('raffle', 'title')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

/**
 * Get transaction by ID
 * @route GET /api/payments/:id
 * @access Private (admin only)
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('participant')
    .populate('raffle')
    .populate('tickets');
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }
  
  res.json({
    success: true,
    data: transaction
  });
});

/**
 * Update transaction status
 * @route PUT /api/payments/:id/status
 * @access Private (admin only)
 */
const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Estado de transacción inválido');
  }
  
  const transaction = await Transaction.findById(req.params.id);
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }
  
  // Update status
  transaction.status = status;
  
  // If confirming a previously non-confirmed transaction
  if (status === 'confirmed' && transaction.status !== 'confirmed') {
    // Update email schedule - 24 hours from now
    const emailDate = new Date();
    emailDate.setHours(emailDate.getHours() + 24);
    transaction.emailScheduledFor = emailDate;
  }
  
  await transaction.save();
  
  res.json({
    success: true,
    message: `Estado de la transacción actualizado a: ${status}`,
    data: transaction
  });
});

/**
 * Send confirmation email immediately
 * @route POST /api/payments/:id/send-email
 * @access Private (admin only)
 */
const sendConfirmationEmailNow = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('participant')
    .populate('raffle')
    .populate('tickets');
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }
  
  if (transaction.status !== 'confirmed') {
    res.status(400);
    throw new Error('Solo se pueden enviar correos para transacciones confirmadas');
  }
  
  try {
    // Get ticket numbers
    const ticketNumbers = transaction.tickets.map(ticket => ticket.number);
    
    // Send email
    await emailService.sendConfirmationEmail(
      transaction,
      transaction.participant,
      transaction.raffle,
      ticketNumbers
    );
    
    res.json({
      success: true,
      message: 'Correo de confirmación enviado con éxito',
      data: {
        sentTo: transaction.participant.email,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500);
    throw new Error(`Error al enviar el correo: ${error.message}`);
  }
});

/**
 * Process all pending emails that are due
 * @route POST /api/payments/process-emails
 * @access Private (admin only)
 */
const processPendingEmails = asyncHandler(async (req, res) => {
  try {
    const count = await emailService.processPendingEmails();
    
    res.json({
      success: true,
      message: `Se procesaron ${count} correos pendientes`,
      data: {
        processedCount: count,
        processedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error processing pending emails:', error);
    res.status(500);
    throw new Error(`Error al procesar correos pendientes: ${error.message}`);
  }
});

module.exports = {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  sendConfirmationEmailNow,
  processPendingEmails
};
