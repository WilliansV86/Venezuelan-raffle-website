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

module.exports = { authAdmin, getAdminRaffles, createRaffle, getAdminTransactions, verifyAdminKey };
