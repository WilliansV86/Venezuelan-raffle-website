const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Raffle = require('../models/Raffle.js');
const Transaction = require('../models/Transaction.js');
const { sendEmail } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = asyncHandler(async (req, res) => {
  console.log('Admin login attempt received');
  console.log('Request body:', req.body);
  
  const { adminKey } = req.body;
  console.log('Admin key provided:', adminKey ? '(key provided)' : '(no key)');
  console.log('Expected admin key:', process.env.ADMIN_KEY ? '(key exists in env)' : '(no key in env)');

  if (adminKey === process.env.ADMIN_KEY) {
    console.log('Admin login successful');
    const token = generateToken('admin_user');
    console.log('Generated token for admin_user');
    
    res.json({
      _id: 'admin_user',
      name: 'Admin',
      email: 'admin@example.com',
      isAdmin: true,
      token: token,
    });
  } else {
    console.log('Admin login failed: Invalid admin key');
    res.status(401).json({ success: false, message: 'Invalid admin key' });
  }
});

// @desc    Verify admin key
// @route   POST /api/admin/verify
// @access  Public
const verifyAdminKey = asyncHandler(async (req, res) => {
  const { adminKey } = req.body;
  if (adminKey === process.env.ADMIN_KEY) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false });
  }
});

// @desc    Get all raffles for admin
// @route   GET /api/admin/raffles
// @access  Private/Admin
const getAdminRaffles = asyncHandler(async (req, res) => {
  console.log('Attempting to fetch raffles for admin...');
  try {
    const raffles = await Raffle.find({});
    console.log(`Successfully fetched ${raffles.length} raffles.`);
    res.json(raffles);
  } catch (error) {
    console.error('Error in getAdminRaffles:', error);
    res.status(500).json({ message: 'Server error while fetching raffles.' });
  }
});

// @desc    Get all transactions for admin
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAdminTransactions = asyncHandler(async (req, res) => {
  // Sort by createdAt in descending order to get the latest transactions first
  const transactions = await Transaction.find({}).sort({ createdAt: -1 }).populate('raffle', 'name');
  res.json(transactions);
});

// @desc    Clear all transactions
// @route   DELETE /api/admin/transactions/clear
// @access  Private/Admin
const clearTransactions = asyncHandler(async (req, res) => {
  try {
    await Transaction.deleteMany({});
    console.log('All transactions have been cleared.');
    res.status(200).json({ 
      success: true, 
      message: 'All transactions have been cleared successfully.' 
    });
  } catch (error) {
    console.error('Error clearing transactions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing transactions.', 
      error: error.message 
    });
  }
});

// @desc    Create a raffle
// @route   POST /api/admin/raffles
// @access  Private/Admin
const createRaffle = asyncHandler(async (req, res) => {
  const { name, price, priceBs, maxTickets, imageUrl } = req.body;

  // Set a default draw date to 7 days from now if not provided
  const drawDate = new Date();
  drawDate.setDate(drawDate.getDate() + 7);

  const raffle = new Raffle({
    name,
    price,
    priceBS: priceBs, // Corrected field name
    maxTickets,
    image: imageUrl, // Corrected field name
    drawDate, // Added required field
    status: 'draft',
    ticketsSold: 0, // Corrected field name
  });

  const createdRaffle = await raffle.save();
  res.status(201).json(createdRaffle);
});

// @desc    Update transaction status
// @route   PATCH /api/admin/transactions/:id/status
// @access  Private/Admin
const updateTransactionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  const transaction = await Transaction.findById(id).populate('raffle', 'name');

  if (!transaction) {
    res.status(404).json({ message: 'Transaction not found' });
    return;
  }

  transaction.status = status;

  try {
    const updatedTransaction = await transaction.save();
    console.log('Transaction status updated and saved successfully.');

    // If the transaction is approved, attempt to send a confirmation email
    if (updatedTransaction.status === 'approved') {
      // This part is wrapped in its own try/catch to prevent email errors from crashing the main flow.
      try {
        console.log('[Email Service] Preparing to send approval email.');
        if (!updatedTransaction.participantEmail || !updatedTransaction.raffle || !updatedTransaction.raffle.name) {
          console.error('[Email Service] CRITICAL: Cannot send email because required data is missing.');
        } else {
          await sendEmail({
            to: updatedTransaction.participantEmail,
            subject: `Confirmación de tu Compra - Rifa: ${updatedTransaction.raffle.name}`,
            html: `
              <h1>¡Tu pago ha sido aprobado!</h1>
              <p>Hola ${updatedTransaction.participantName},</p>
              <p>Tu compra para la rifa "<strong>${updatedTransaction.raffle.name}</strong>" ha sido confirmada con éxito.</p>
              <p>Tus números de la suerte son:</p>
              <h2>${updatedTransaction.tickets.join(', ')}</h2>
              <br>
              <p>Atentamente,</p>
              <p>El equipo de Tu Suerte Está Aquí</p>
            `,
          });
          console.log(`Confirmation email sent to ${updatedTransaction.participantEmail}`);
        }
      } catch (emailError) {
        console.error('[CONTROLLER] Non-blocking error: Failed to send email. Full error:', emailError);
      }
    }

    res.json(updatedTransaction);

  } catch (error) {
    console.error('CRITICAL: Failed to save transaction to database. Error:', error);
    res.status(500).json({ message: 'Database error while updating transaction.', error: error.message });
  }
});

module.exports = { 
  authAdmin, 
  getAdminRaffles, 
  createRaffle, 
  getAdminTransactions, 
  verifyAdminKey, 
  updateTransactionStatus,
  clearTransactions
};
