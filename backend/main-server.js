// Main server with ticket purchase functionality
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');

// Set up MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGO_URI environment variable is not defined');
  process.exit(1);
}

// Set up multer storage for file uploads
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
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Define file filter function for multer
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Initialize express app
const app = express();

// Middleware - Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

// Pre-flight requests
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define schemas
const participantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  identificationNumber: String
}, { timestamps: true });

const raffleSchema = new mongoose.Schema({
  title: String,
  description: String,
  ticketPrice: Number,
  startDate: Date,
  endDate: Date,
  drawDate: Date,
  isActive: Boolean,
  maxTickets: Number
}, { timestamps: true });

const ticketSchema = new mongoose.Schema({
  number: String,
  raffleId: mongoose.Schema.Types.ObjectId,
  participantId: mongoose.Schema.Types.ObjectId,
  transactionId: mongoose.Schema.Types.ObjectId,
  raffle: { type: mongoose.Schema.Types.ObjectId, ref: 'Raffle' },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  ticketNumber: String
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  participant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Participant' 
  },
  raffle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Raffle' 
  },
  tickets: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket' 
  }],
  paymentAmount: Number,
  paymentMethod: String,
  paymentReference: String,
  paymentProof: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  adminNotes: String,
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  emailScheduledFor: Date,
  ticketCount: Number,
  ticketPrice: Number
}, { timestamps: true });

// Register models
const Participant = mongoose.model('Participant', participantSchema);
const Raffle = mongoose.model('Raffle', raffleSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Routes
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Get active raffles - endpoint used by frontend
app.get('/api/raffles/active', async (req, res) => {
  try {
    const raffles = await Raffle.find({ isActive: true });
    res.json({ success: true, data: raffles });
  } catch (error) {
    console.error('Error fetching active raffles:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get raffles with query params
app.get('/api/raffles', async (req, res) => {
  try {
    const raffles = await Raffle.find({ isActive: true });
    res.json({ success: true, data: raffles });
  } catch (error) {
    console.error('Error fetching raffles:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get raffle by ID
app.get('/api/raffles/:id', async (req, res) => {
  try {
    const raffle = await Raffle.findById(req.params.id);
    if (!raffle) {
      return res.status(404).json({ success: false, message: 'Raffle not found' });
    }
    res.json({ success: true, data: raffle });
  } catch (error) {
    console.error('Error fetching raffle:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a test raffle if none exists
app.get('/api/create-test-raffle', async (req, res) => {
  try {
    const existingRaffles = await Raffle.find();
    
    if (existingRaffles.length === 0) {
      const testRaffle = new Raffle({
        title: 'Sorteo Motocicleta 2024',
        description: 'Gana una motocicleta de último modelo',
        ticketPrice: 5,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        drawDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), // 31 days from now
        isActive: true,
        maxTickets: 1000
      });
      
      await testRaffle.save();
      res.json({ success: true, message: 'Test raffle created', data: testRaffle });
    } else {
      res.json({ success: true, message: 'Raffles already exist', data: existingRaffles });
    }
  } catch (error) {
    console.error('Error creating test raffle:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Purchase tickets endpoint
app.post('/api/tickets/purchase', upload.single('paymentProof'), async (req, res) => {
  try {
    console.log('Purchase request received:', req.body);
    
    // Check for required fields
    const { raffleId, name, email, phone, identificationNumber, quantity, paymentMethod, paymentReference } = req.body;
    
    if (!raffleId || !name || !email || !quantity || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Find or create participant
    let participant;
    try {
      participant = await Participant.findOne({ email });
      
      if (!participant) {
        participant = new Participant({
          name,
          email,
          phone,
          identificationNumber
        });
        
        await participant.save();
        console.log(`Created new participant: ${participant._id}`);
      } else {
        console.log(`Found existing participant: ${participant._id}`);
      }
    } catch (participantError) {
      console.error('Error with participant:', participantError);
      throw participantError;
    }
    
    // Find raffle
    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).json({
        success: false,
        message: 'Raffle not found'
      });
    }
    
    // Generate tickets
    const tickets = [];
    const ticketNumbers = [];
    
    try {
      for (let i = 0; i < quantity; i++) {
        let ticketNumber;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!ticketNumber && attempts < maxAttempts) {
          // Generate a random 4-digit number
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          const candidateNumber = randomNum.toString();
          
          // Check if this number is already taken
          const existingTicket = await Ticket.findOne({ 
            number: candidateNumber,
            raffleId: raffle._id
          });
          
          if (!existingTicket) {
            ticketNumber = candidateNumber;
          } else {
            console.log(`Ticket ${candidateNumber} already exists, trying again...`);
            attempts++;
          }
        }
        
        if (!ticketNumber) {
          throw new Error(`Could not generate unique ticket number after ${maxAttempts} attempts`);
        }
        
        console.log(`Generated ticket number: ${ticketNumber}`);
        ticketNumbers.push(ticketNumber);
        
        // Create ticket
        const ticket = new Ticket({
          number: ticketNumber,
          raffleId: raffle._id,
          participantId: participant._id,
          raffle: raffle._id,
          participant: participant._id,
          ticketNumber: ticketNumber
        });
        
        await ticket.save();
        tickets.push(ticket);
      }
    } catch (ticketError) {
      console.error('Error generating tickets:', ticketError);
      throw ticketError;
    }
    
    // Create transaction record
    try {
      const transaction = new Transaction({
        participant: participant._id,
        raffle: raffle._id,
        paymentAmount: quantity * raffle.ticketPrice,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference,
        paymentProof: req.file ? req.file.path : null,
        ticketCount: quantity,
        ticketPrice: raffle.ticketPrice,
        tickets: tickets.map(ticket => ticket._id),
        status: 'pending',
        emailScheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        emailSent: false
      });
      
      await transaction.save();
      console.log(`Transaction created: ${transaction._id}. Emails will be sent after admin approval.`);
      
      // Update tickets with transaction ID
      for (const ticket of tickets) {
        ticket.transactionId = transaction._id;
        ticket.transaction = transaction._id;
        await ticket.save();
      }
      
      // Send notification to admin (optional)
      if (process.env.ADMIN_EMAIL && process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
        try {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          
          const paymentProofUrl = req.file ? 
            `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}` : 
            'No payment proof attached';
          
          const adminMsg = {
            to: process.env.ADMIN_EMAIL,
            from: process.env.EMAIL_FROM,
            subject: `New Pending Transaction - ${transaction._id}`,
            html: `
              <h2>New pending transaction received</h2>
              <p><strong>Transaction ID:</strong> ${transaction._id}</p>
              <p><strong>Participant:</strong> ${participant.name} (${participant.email})</p>
              <p><strong>Amount:</strong> $${transaction.paymentAmount}</p>
              <p><strong>Ticket Count:</strong> ${quantity}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Payment Reference:</strong> ${paymentReference || 'N/A'}</p>
              <p>Please login to the admin dashboard to review and confirm this payment.</p>
              ${req.file ? `<p><strong>Payment Proof:</strong><br><img src="${paymentProofUrl}" alt="Payment Proof" style="max-width: 500px;" /></p>` : ''}
            `
          };
          
          await sgMail.send(adminMsg);
          console.log(`Admin notification sent to ${process.env.ADMIN_EMAIL}`);
        } catch (emailError) {
          console.error('Error sending admin notification:', emailError);
          // Don't fail the transaction just because admin notification failed
        }
      }
      
      // Return success response
      res.json({
        success: true,
        message: 'Purchase successful! Your payment is pending confirmation. Once confirmed, you will receive an email with your ticket numbers.',
        data: {
          transactionId: transaction._id,
          // Don't send ticket numbers yet - they'll be sent in the confirmation email
          paymentStatus: 'pending'
        }
      });
    } catch (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw transactionError;
    }
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during purchase'
    });
  }
});

// Start server
const PORT = process.env.PORT || 5100;
app.listen(PORT, () => {
  console.log(`Main server running on port ${PORT}`);
});
