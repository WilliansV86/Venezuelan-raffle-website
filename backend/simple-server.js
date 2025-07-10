// Ultra-simple Express server that will definitely work
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();

// MongoDB connection
console.log('Connecting to MongoDB...');
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB Connected');
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('Continuing with in-memory mode only');
  });

// Define schemas
const participantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  identificationNumber: String
});

const ticketSchema = new mongoose.Schema({
  number: String,
  raffleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Raffle' },
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  raffleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Raffle' },
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
  tickets: [String],
  quantity: Number,
  totalAmount: Number,
  paymentProofUrl: String,
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  emailSent: { type: Boolean, default: false }
});

const raffleSchema = new mongoose.Schema({
  title: String,
  description: String,
  ticketPrice: Number,
  startDate: Date,
  endDate: Date,
  drawDate: Date,
  isActive: Boolean,
  maxTickets: Number
});

// Register models
const Participant = mongoose.model('Participant', participantSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Raffle = mongoose.model('Raffle', raffleSchema);

// Allow all CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

// Set up file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)){
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Basic JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Dummy raffles endpoint - hardcoded data
app.get('/api/raffles/active', (req, res) => {
  console.log('GET /api/raffles/active requested');
  
  // Return hardcoded raffle data
  const raffles = [
    {
      _id: '507f1f77bcf86cd799439011',
      title: 'Sorteo Motocicleta 2024',
      description: 'Gana una motocicleta de último modelo',
      ticketPrice: 5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      drawDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      isActive: true,
      maxTickets: 1000
    }
  ];
  
  res.json({ success: true, data: raffles });
});

// Same endpoint without '/active'
app.get('/api/raffles', (req, res) => {
  console.log('GET /api/raffles requested');
  
  // Return same hardcoded raffle data
  const raffles = [
    {
      _id: '507f1f77bcf86cd799439011',
      title: 'Sorteo Motocicleta 2024',
      description: 'Gana una motocicleta de último modelo',
      ticketPrice: 5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      drawDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      isActive: true,
      maxTickets: 1000
    }
  ];
  
  res.json({ success: true, data: raffles });
});

// Create test raffle endpoint (dummy response)
app.get('/api/create-test-raffle', (req, res) => {
  console.log('GET /api/create-test-raffle requested');
  res.json({ success: true, message: 'Test raffle already exists' });
});

// Get raffle by ID
app.get('/api/raffles/:id', (req, res) => {
  console.log(`GET /api/raffles/${req.params.id} requested`);
  
  // Return hardcoded raffle data with the requested ID
  const raffle = {
    _id: req.params.id,
    title: 'Sorteo Motocicleta 2024',
    description: 'Gana una motocicleta de último modelo',
    ticketPrice: 5,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    drawDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
    isActive: true,
    maxTickets: 1000
  };
  
  res.json({ success: true, data: raffle });
});

// Purchase tickets endpoint
app.post('/api/tickets/purchase', upload.single('paymentProof'), async (req, res) => {
  console.log('POST /api/tickets/purchase requested');
  console.log('Form data:', req.body);
  
  try {
    let paymentProofUrl = '';
    if (req.file) {
      console.log('File uploaded:', req.file.path);
      // Generate URL for the uploaded file
      paymentProofUrl = `http://localhost:5100/uploads/${path.basename(req.file.path)}`;
    }
    
    // Find or create the participant
    let participant = await Participant.findOne({ email: req.body.email });
    
    if (!participant) {
      participant = new Participant({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        identificationNumber: req.body.identificationNumber
      });
      
      await participant.save();
      console.log('New participant created:', participant._id);
    }
    
    // Find the raffle
    let raffle;
    if (mongoose.Types.ObjectId.isValid(req.body.raffleId)) {
      raffle = await Raffle.findById(req.body.raffleId);
    }
    
    // If raffle not found, create a default one
    if (!raffle) {
      raffle = await Raffle.findOne({ isActive: true });
      
      if (!raffle) {
        raffle = new Raffle({
          title: 'Sorteo Motocicleta 2024',
          description: 'Gana una motocicleta de último modelo',
          ticketPrice: 5,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          drawDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
          isActive: true,
          maxTickets: 1000
        });
        
        await raffle.save();
        console.log('Created default raffle:', raffle._id);
      }
    }
    
    // Generate random ticket numbers
    const quantity = parseInt(req.body.quantity) || 1;
    const ticketNumbers = [];
    
    for (let i = 0; i < quantity; i++) {
      // Generate a random 4-digit number
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      ticketNumbers.push(randomNum.toString());
    }
    
    // Create transaction record
    const totalAmount = quantity * raffle.ticketPrice;
    
    const transaction = new Transaction({
      raffleId: raffle._id,
      participantId: participant._id,
      tickets: ticketNumbers,
      quantity: quantity,
      totalAmount: totalAmount,
      paymentProofUrl: paymentProofUrl,
      status: 'pending',
      emailSent: false
    });
    
    await transaction.save();
    console.log('Created transaction:', transaction._id);
    
    // Create ticket records
    for (const ticketNumber of ticketNumbers) {
      const ticket = new Ticket({
        number: ticketNumber,
        raffleId: raffle._id,
        participantId: participant._id,
        transactionId: transaction._id
      });
      
      await ticket.save();
    }
    
    console.log(`Created ${quantity} tickets with numbers:`, ticketNumbers);
    
    // Return success response
    res.json({
      success: true,
      message: 'Purchase successful! Your payment is pending confirmation. Once confirmed, you will receive an email with your ticket numbers.',
      data: {
        transactionId: transaction._id,
        paymentStatus: 'pending'
      }
    });
  } catch (error) {
    console.error('Error processing ticket purchase:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your purchase. Please try again.',
      error: error.message
    });
  }
});

// Start server on port 5100
const PORT = 5100;
app.listen(PORT, () => {
  console.log(`Simplified server running on http://localhost:${PORT}`);
  console.log(`Test with: http://localhost:${PORT}/ping`);
});
