const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Raffle = require('../models/Raffle');

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

  const paymentScreenshot = req.file ? req.file.path : null;

  if (!raffleId || !name || !lastName || !email || !cedula || !whatsapp || !paymentMethod || !totalAmount) {
    res.status(400);
    throw new Error('Por favor, complete todos los campos requeridos.');
  }

  if (!paymentScreenshot) {
    res.status(400);
    throw new Error('El capture del pago es requerido.');
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
  const transaction = await Transaction.findById(req.params.id);

  if (transaction) {
    transaction.status = status;
    const updatedTransaction = await transaction.save();
    res.json({ success: true, data: updatedTransaction });
  } else {
    res.status(404);
    throw new Error('Transacción no encontrada');
  }
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
