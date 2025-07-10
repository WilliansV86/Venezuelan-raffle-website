require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create Express app
const app = express();

// Enable CORS for all origins during testing
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MONGODB CONNECTION WITH ROBUST RECONNECTION
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://WilliansV86:Ve17767135..!!@cluster0.adlajpr.mongodb.net/raffle?retryWrites=true&w=majority';

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB Connection Error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('connected', () => {
  console.info('MongoDB connected successfully');
});

// Connect with retry logic
const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  return mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  });
};

const connectDB = async () => {
  try {
    await connectWithRetry();
    console.log(`MongoDB Connected`);
    return mongoose.connection;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Define schemas here directly to avoid import issues
// Ticket Schema
const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: Number,
    required: true,
    unique: true
  },
  raffleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Raffle'
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold'],
    default: 'available'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true
  },
  whatsappNumber: {
    type: String,
    required: [true, 'Please provide a WhatsApp number'],
    trim: true
  },
  identificationNumber: {
    type: String,
    required: [true, 'Please provide an identification number'],
    trim: true
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please select a payment method'],
    trim: true
  },
  paymentReference: {
    type: String,
    required: [true, 'Please provide a payment reference'],
    trim: true
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Please provide the payment amount']
  },
  paymentProof: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide the quantity of tickets'],
    min: [1, 'Minimum 1 ticket required']
  },
  tickets: [{
    type: Number
  }],
  raffleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please provide a raffle ID']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Raffle Schema
const raffleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  prize: {
    type: String,
    required: true,
    trim: true
  },
  prizeImage: {
    type: String,
    trim: true
  },
  ticketPrice: {
    type: Number,
    required: true
  },
  totalTickets: {
    type: Number,
    required: true
  },
  soldTickets: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  drawDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  winningTicket: {
    type: Number
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Ticket = mongoose.model('Ticket', ticketSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Raffle = mongoose.model('Raffle', raffleSchema);

// Simple health check route that doesn't require DB connection
app.get('/api/health/ping', (req, res) => {
  res.json({ status: 'ok', message: 'pong' });
});

// Health check route that verifies MongoDB connection
app.get('/api/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({
      status: 'ok',
      mongodb: 'connected',
      server: 'online',
      time: new Date().toISOString(),
    });
  } else {
    res.status(500).json({
      status: 'error',
      mongodb: 'disconnected',
      server: 'online',
      time: new Date().toISOString(),
    });
  }
});

// Ticket Purchase API
app.post('/api/tickets/purchase', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      whatsappNumber, 
      identificationNumber,
      quantity, 
      paymentMethod, 
      paymentReference, 
      paymentAmount,
      raffleId 
    } = req.body;
    
    // Basic validation
    if (!fullName || !email || !quantity || !paymentMethod || !paymentReference) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Specific validation for payment methods
    const paymentMethodLower = paymentMethod.toLowerCase();
    if ((paymentMethodLower === 'zelle' || paymentMethodLower === 'binance') && quantity < 10) {
      return res.status(400).json({ 
        message: `Minimum 10 tickets required for ${paymentMethodLower === 'zelle' ? 'Zelle' : 'Binance'} payment` 
      });
    }
    
    // Create a new transaction
    const transaction = new Transaction({
      fullName,
      email,
      whatsappNumber,
      identificationNumber,
      paymentMethod,
      paymentReference,
      paymentAmount: paymentAmount || quantity * 150, // Default to $1.50 per ticket
      quantity,
      raffleId,
      status: 'pending'
    });
    
    // Save the transaction
    await transaction.save();
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Purchase request submitted successfully',
      data: {
        transactionId: transaction._id,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Error in ticket purchase:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || 'Error processing ticket purchase'
    });
  }
});

// List all active raffles
app.get('/api/raffles', async (req, res) => {
  try {
    const raffles = await Raffle.find({ status: 'active' }).select('name description prize ticketPrice totalTickets soldTickets drawDate');
    
    return res.status(200).json({
      success: true,
      count: raffles.length,
      data: raffles
    });
  } catch (error) {
    console.error('Error fetching raffles:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || 'Error fetching raffles'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5001;

// Start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      
      // Display connection info
      console.log('\n======= CONNECTION INFO =======');
      console.log('MongoDB Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
      console.log('Server listening at http://localhost:' + PORT);
      console.log('Test API at: http://localhost:' + PORT + '/api/health/ping');
      console.log('=============================\n');
    });
  })
  .catch(err => {
    console.error(`Error initializing the application: ${err.message}`);
    process.exit(1);
  });
