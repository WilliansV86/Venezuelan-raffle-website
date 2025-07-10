// Improved standalone server with correct data format for frontend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Set up CORS with proper allowed origins
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse JSON request body
app.use(express.json());

// Serve static files from uploads and public directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/images', express.static(path.join(__dirname, '..', 'frontend', 'public', 'images')));

// Set up file uploads with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// In-memory database with proper data structure for frontend
const DB = {
  participants: [],
  transactions: [],
  tickets: [],
  raffles: [
    {
      _id: 'raffle_moto_2024',
      title: 'Sorteo Motocicleta 2024',
      description: 'Gana una motocicleta de último modelo. El sorteo se realizará el 31 de diciembre de 2024.',
      ticketPrice: 5,
      startDate: new Date('2024-01-01T12:00:00Z'),
      endDate: new Date('2024-12-31T23:59:59Z'),
      status: 'active',
      percentageSold: 45,
      image: '/images/toyota-hilux-raffle.png',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z')
    },
    {
      _id: 'raffle_car_2024',
      title: 'Gran Sorteo de Carro 2024',
      description: 'Participa para ganar un carro cero kilómetros. ¡No pierdas esta oportunidad!',
      ticketPrice: 10,
      startDate: new Date('2024-02-15T00:00:00Z'),
      endDate: new Date('2024-12-15T23:59:59Z'),
      status: 'active',
      percentageSold: 65,
      image: '/images/toyota-hilux-raffle.png',
      createdAt: new Date('2024-02-15T00:00:00Z'),
      updatedAt: new Date('2024-02-15T00:00:00Z')
    },
    {
      _id: 'raffle_vacation_2024',
      title: 'Sorteo Vacaciones Todo Incluido',
      description: 'Gana un paquete vacacional para dos personas. Incluye boletos aéreos y hotel.',
      ticketPrice: 3,
      startDate: new Date('2024-03-01T00:00:00Z'),
      endDate: new Date('2024-08-31T23:59:59Z'),
      status: 'active',
      percentageSold: 25,
      image: '/images/toyota-hilux-raffle.png',
      createdAt: new Date('2024-03-01T00:00:00Z'),
      updatedAt: new Date('2024-03-01T00:00:00Z')
    },
    {
      _id: 'raffle_laptop_2023',
      title: 'Sorteo Laptop Gaming',
      description: 'Sorteo de laptop gaming de última generación. Completado en diciembre 2023.',
      ticketPrice: 2,
      startDate: new Date('2023-10-01T00:00:00Z'),
      endDate: new Date('2023-12-15T23:59:59Z'),
      status: 'completed',
      percentageSold: 100,
      image: '/images/toyota-hilux-raffle.png',
      createdAt: new Date('2023-10-01T00:00:00Z'),
      updatedAt: new Date('2023-12-16T00:00:00Z')
    }
  ],
  settings: {
    exchangeRate: 800 // Global exchange rate setting
  }
};

// HEALTH CHECK ENDPOINTS
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'online',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API ENDPOINTS

// Get all raffles in the format expected by the frontend
app.get('/api/raffles', (req, res) => {
  console.log('GET /api/raffles requested');
  res.json({
    success: true,
    count: DB.raffles.length,
    data: DB.raffles
  });
});

// Get active raffles - used by the homepage
app.get('/api/raffles/active', (req, res) => {
  console.log('GET /api/raffles/active requested');
  const activeRaffles = DB.raffles.filter(raffle => raffle.status === 'active');
  res.json({
    success: true,
    count: activeRaffles.length,
    data: activeRaffles
  });
});

// Get past raffles - used by the homepage
app.get('/api/raffles/past', (req, res) => {
  console.log('GET /api/raffles/past requested');
  const pastRaffles = DB.raffles.filter(raffle => raffle.status === 'completed');
  res.json({
    success: true,
    count: pastRaffles.length,
    data: pastRaffles
  });
});

// Get a single raffle by ID
app.get('/api/raffles/:id', (req, res) => {
  console.log(`GET /api/raffles/${req.params.id} requested`);
  const raffle = DB.raffles.find(r => r._id === req.params.id);
  
  if (!raffle) {
    return res.status(404).json({
      success: false,
      message: 'Raffle not found'
    });
  }
  
  res.json({
    success: true,
    data: raffle
  });
});

// ADMIN MIDDLEWARE
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || '';
  const correctKey = process.env.ADMIN_KEY || 'test-admin-key-123';
  
  if (adminKey !== correctKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid admin key'
    });
  }
  
  next();
};

// PURCHASE TICKETS ROUTE
app.post('/api/tickets/purchase', upload.single('paymentProof'), (req, res) => {
  console.log('====== PURCHASE REQUEST DATA ======');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('File:', req.file ? req.file.filename : 'No file uploaded');
  
  try {
    // Generate transaction ID
    const transactionId = 'txn_' + Date.now();
    
    // Process ticket purchase (in-memory)
    const transaction = {
      _id: transactionId,
      raffleId: req.body.raffleId || 'raffle_moto_2024',
      buyerName: req.body.fullName || req.body.name || 'Anonymous Buyer',
      buyerEmail: req.body.email || 'buyer@example.com',
      buyerPhone: req.body.phone || 'N/A',
      amount: parseFloat(req.body.amount) || 5,
      currency: req.body.currency || 'USD',
      ticketCount: parseInt(req.body.ticketCount) || 1,
      paymentMethod: req.body.paymentMethod || 'Bank Transfer',
      paymentProof: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'pending',
      createdAt: new Date(),
      ticketNumbers: []
    };
    
    // Generate ticket numbers (4 digits)
    for (let i = 0; i < transaction.ticketCount; i++) {
      let ticketNumber;
      do {
        ticketNumber = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit number
      } while (DB.tickets.some(t => t.number === ticketNumber));
      
      const ticket = {
        _id: `ticket_${Date.now()}_${i}`,
        number: ticketNumber,
        raffleId: transaction.raffleId,
        transactionId: transaction._id,
        buyerName: transaction.buyerName,
        buyerEmail: transaction.buyerEmail,
        status: 'pending',
        createdAt: new Date()
      };
      
      DB.tickets.push(ticket);
      transaction.ticketNumbers.push(ticketNumber);
    }
    
    // Store transaction
    DB.transactions.push(transaction);
    
    // Log to console
    console.log(`Transaction ${transaction._id} created with ${transaction.ticketCount} tickets`);
    console.log(`Ticket numbers: ${transaction.ticketNumbers.join(', ')}`);
    
    // Send response
    res.json({
      success: true,
      message: 'Purchase successful! Your payment is pending confirmation.',
      data: {
        transactionId: transaction._id,
        ticketCount: transaction.ticketCount,
        ticketNumbers: transaction.ticketNumbers,
        status: 'pending'
      }
    });
    
  } catch (error) {
    console.error('Error processing ticket purchase:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your purchase.',
      error: error.message
    });
  }
});

// ADMIN ROUTES
app.get('/api/admin/transactions', adminAuth, (req, res) => {
  res.json({
    success: true,
    count: DB.transactions.length,
    data: DB.transactions
  });
});

app.post('/api/admin/transactions/:id/approve', adminAuth, (req, res) => {
  const transactionId = req.params.id;
  const transaction = DB.transactions.find(t => t._id === transactionId);
  
  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }
  
  transaction.status = 'approved';
  
  // Update associated tickets
  DB.tickets
    .filter(t => t.transactionId === transactionId)
    .forEach(ticket => {
      ticket.status = 'active';
    });
  
  console.log(`Transaction ${transactionId} approved`);
  console.log('Email notification would be sent here');
  
  res.json({
    success: true,
    message: 'Transaction approved',
    data: transaction
  });
});

// Start server
const PORT = process.env.PORT || 5100;
app.listen(PORT, () => {
  console.log(`🚀 Enhanced standalone server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/ping`);
  console.log(`API endpoint: http://localhost:${PORT}/api/raffles`);
  console.log(`Admin endpoint: http://localhost:${PORT}/api/admin/transactions (requires admin key)`);
});
