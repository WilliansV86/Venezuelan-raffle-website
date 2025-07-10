// FINAL INTEGRATED SOLUTION - Main server with full admin integration
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Create Express app
const app = express();

// MongoDB connection
console.log('Connecting to MongoDB...');
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
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

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Schema definitions
const participantSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  identificationNumber: String,
  createdAt: { type: Date, default: Date.now }
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

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB Connected');
    startServer();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    console.error('This error usually means the server cannot be reached.');
    console.error('Please check that your IP is whitelisted in MongoDB Atlas.');
    process.exit(1);
  });

// Admin auth middleware
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const validKey = process.env.ADMIN_KEY || 'test-admin-key-123';
  
  if (!adminKey || adminKey !== validKey) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Admin access required' 
    });
  }
  
  next();
};

// Helper function to send emails
async function sendEmail(options) {
  console.log('Preparing to send email to:', options.to);
  
  try {
    // Email sending logic would go here
    // Using console.log for testing
    console.log('🔔 EMAIL WOULD BE SENT:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text);
    
    // If SendGrid API key exists, we'd use it
    if (process.env.SENDGRID_API_KEY) {
      console.log('Would send via SendGrid API');
    } else {
      console.log('No email provider configured, email not actually sent');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function startServer() {
  // MAIN API ENDPOINTS

  // Health check endpoint
  app.get('/ping', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all active raffles
  app.get('/api/raffles/active', async (req, res) => {
    try {
      console.log('GET /api/raffles/active requested');
      const raffles = await Raffle.find({ isActive: true });
      console.log(`Found ${raffles.length} active raffles`);
      
      // If no raffles, create a test one
      if (raffles.length === 0) {
        const testRaffle = new Raffle({
          title: 'Sorteo Motocicleta 2024',
          description: 'Gana una motocicleta de último modelo',
          ticketPrice: 5,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          drawDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
          isActive: true,
          maxTickets: 1000
        });
        
        await testRaffle.save();
        console.log('Created test raffle automatically');
        return res.json([testRaffle]);
      }
      
      res.json(raffles);
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get all raffles endpoint
  app.get('/api/raffles', async (req, res) => {
    try {
      console.log('GET /api/raffles requested');
      const raffles = await Raffle.find();
      console.log(`Found ${raffles.length} raffles total`);
      res.json(raffles);
    } catch (error) {
      console.error('Error fetching all raffles:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get raffle by ID
  app.get('/api/raffles/:id', async (req, res) => {
    try {
      console.log(`GET /api/raffles/${req.params.id} requested`);
      
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid raffle ID format' 
        });
      }
      
      const raffle = await Raffle.findById(req.params.id);
      
      if (!raffle) {
        return res.status(404).json({ 
          success: false, 
          message: 'Raffle not found' 
        });
      }
      
      res.json(raffle);
    } catch (error) {
      console.error('Error fetching raffle by ID:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Create test raffle endpoint
  app.get('/api/create-test-raffle', async (req, res) => {
    try {
      console.log('Creating test raffle...');
      const existingRaffles = await Raffle.find();
      
      if (existingRaffles.length === 0) {
        const testRaffle = new Raffle({
          title: 'Sorteo Motocicleta 2024',
          description: 'Gana una motocicleta de último modelo',
          ticketPrice: 5,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          drawDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
          isActive: true,
          maxTickets: 1000
        });
        
        await testRaffle.save();
        console.log('Test raffle created:', testRaffle.title);
        res.json({ success: true, message: 'Test raffle created', data: testRaffle });
      } else {
        console.log('Raffles already exist:', existingRaffles.length);
        res.json({ success: true, message: 'Raffles already exist', data: existingRaffles });
      }
    } catch (error) {
      console.error('Error creating test raffle:', error);
      res.status(500).json({ success: false, message: error.message });
    }
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

      // Send notification email to admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      await sendEmail({
        to: adminEmail,
        subject: 'New Ticket Purchase Pending Approval',
        text: `A new ticket purchase has been made and is pending approval.\n\nParticipant: ${participant.name}\nEmail: ${participant.email}\nTickets: ${quantity}\nTotal: $${totalAmount}`
      });
      
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

  // ADMIN ENDPOINTS

  // Get all transactions
  app.get('/api/admin/transactions', adminAuth, async (req, res) => {
    try {
      console.log('GET /api/admin/transactions requested');
      
      const transactions = await Transaction.find()
        .populate('participantId')
        .populate('raffleId')
        .sort({ createdAt: -1 });
      
      res.json({ success: true, data: transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Get transaction by ID
  app.get('/api/admin/transactions/:id', adminAuth, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid transaction ID format' 
        });
      }
      
      const transaction = await Transaction.findById(req.params.id)
        .populate('participantId')
        .populate('raffleId');
      
      if (!transaction) {
        return res.status(404).json({ 
          success: false, 
          message: 'Transaction not found' 
        });
      }
      
      res.json({ success: true, data: transaction });
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Update transaction status
  app.put('/api/admin/transactions/:id', adminAuth, async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid transaction ID format' 
        });
      }
      
      const { status } = req.body;
      
      if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be 'pending', 'confirmed', or 'rejected'"
        });
      }
      
      const transaction = await Transaction.findById(req.params.id);
      
      if (!transaction) {
        return res.status(404).json({ 
          success: false, 
          message: 'Transaction not found' 
        });
      }
      
      transaction.status = status;
      transaction.updatedAt = new Date();
      
      // If status is confirmed and email hasn't been sent yet
      if (status === 'confirmed' && !transaction.emailSent) {
        const participant = await Participant.findById(transaction.participantId);
        const raffle = await Raffle.findById(transaction.raffleId);
        
        if (participant && participant.email) {
          // Send email notification
          const emailSent = await sendEmail({
            to: participant.email,
            subject: 'Your Raffle Tickets Have Been Confirmed',
            text: `
              Dear ${participant.name},
              
              Your payment for the raffle "${raffle?.title}" has been confirmed!
              
              Your ticket numbers are: ${transaction.tickets.join(', ')}
              
              Thank you for your purchase.
              
              Best regards,
              The Raffle Team
            `
          });
          
          transaction.emailSent = emailSent;
        }
      }
      
      await transaction.save();
      
      res.json({ 
        success: true, 
        message: `Transaction status updated to ${status}`,
        data: transaction
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Start server
  const PORT = process.env.PORT || 5100;
  app.listen(PORT, () => {
    console.log(`💻 Server running on http://localhost:${PORT}`);
    console.log(`Test URL: http://localhost:${PORT}/ping`);
    console.log(`Raffles endpoint: http://localhost:${PORT}/api/raffles/active`);
    console.log('Admin endpoints available at /api/admin/transactions');
  });
}
