const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Raffle = require('../models/Raffle.js');
const Transaction = require('../models/Transaction.js');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = asyncHandler(async (req, res) => {
  const { adminKey } = req.body;

  if (adminKey === process.env.ADMIN_KEY) {
    res.json({
      _id: 'admin_user',
      name: 'Admin',
      email: 'admin@example.com',
      isAdmin: true,
      token: generateToken('admin_user'),
    });
  } else {
    res.status(401);
    throw new Error('Invalid admin key');
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
  const raffles = await Raffle.find({});
  res.json(raffles);
});

// @desc    Get all transactions for admin
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getAdminTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({}).populate('raffle', 'name');
  res.json(transactions);
});

module.exports = { authAdmin, getAdminRaffles, getAdminTransactions, verifyAdminKey };
