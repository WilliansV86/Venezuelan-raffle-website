// Simplified standalone server with in-memory data
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// In-memory database
const DB = {
  participants: [],
  transactions: [],
  tickets: [],
  raffles: [
    {
      _id: 'raffle_moto_2024',
      title: 'Sorteo Motocicleta 2024',
      description: 'Gana una moto 0km. El sorteo se realizará el 31 de diciembre de 2024.',
      ticketPriceUSD: 5,
      ticketPriceBS: 4000,
      totalTickets: 1000,
      isActive: true,
      imageUrl: 'http://localhost:5100/uploads/raffle-image.jpg',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      updatedAt: new Date('2024-01-01T12:00:00Z')
    }
  ],
  settings: {
    exchangeRate: 800 // Global exchange rate setting
  }
};

// Set up file uploads with multer
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

// Enhanced CORS settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Debugging endpoint for testing form data
app.post('/api/debug-form', upload.single('paymentProof'), (req, res) => {
  console.log('=========== DEBUG FORM DATA ===========');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('File:', req.file ? req.file.filename : 'No file uploaded');
  console.log('=======================================');
  
  // Send back all the data we received
  res.json({
    success: true,
    message: 'Form data received and logged',
    data: {
      body: req.body,
      file: req.file ? {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    }
  });
});

// Get active raffles
app.get('/api/raffles/active', (req, res) => {
  console.log('GET /api/raffles/active requested');
  const activeRaffles = DB.raffles.filter(raffle => raffle.isActive);
  res.json(activeRaffles);
});

// ADMIN ROUTES
// Admin auth middleware
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const validKey = process.env.ADMIN_KEY || 'test-admin-key-123';
  
  if (!adminKey || adminKey !== validKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
  }
  
  next();
};

// Get all raffles
app.get('/api/raffles', (req, res) => {
  console.log('GET /api/raffles requested');
  res.json(DB.raffles);
});

// Admin endpoint to update raffle details
// Admin endpoint to update raffle details, now with image upload
app.put('/api/admin/raffles/:id', adminAuth, upload.single('raffleImage'), (req, res) => {
  console.log('PUT /api/admin/raffles/:id requested');
  const { id } = req.params;
  const { 
    title, 
    description, 
    ticketPriceUSD, 
    ticketPriceBS, 
    defaultCurrency, 
    isActive 
  } = req.body;
  
  // Find raffle
  const raffleIndex = DB.raffles.findIndex(raffle => raffle._id === id);
  
  if (raffleIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Raffle not found'
    });
  }
  
  // Update raffle data
  const updatedRaffle = {
    ...DB.raffles[raffleIndex],
    title: title || DB.raffles[raffleIndex].title,
    description: description || DB.raffles[raffleIndex].description,
    ticketPriceUSD: ticketPriceUSD !== undefined ? parseFloat(ticketPriceUSD) : DB.raffles[raffleIndex].ticketPriceUSD,
    ticketPriceBS: ticketPriceBS !== undefined ? parseFloat(ticketPriceBS) : DB.raffles[raffleIndex].ticketPriceBS,
    totalTickets: totalTickets !== undefined ? parseInt(totalTickets, 10) : DB.raffles[raffleIndex].totalTickets,
    isActive: typeof isActive === 'boolean' ? isActive : DB.raffles[raffleIndex].isActive,
    updatedAt: new Date()
  };

  // If a new image was uploaded, update the imageUrl
  if (req.file) {
    updatedRaffle.imageUrl = `http://localhost:5100/uploads/${req.file.filename}`;
  }
  
  DB.raffles[raffleIndex] = updatedRaffle;
  
  // Exchange rate no longer used in the updated system
  
  res.json(updatedRaffle);
});

// Get ticket sales stats for a raffle
app.get('/api/raffles/:id/stats', (req, res) => {
  const { id } = req.params;
  const raffle = DB.raffles.find(r => r._id === id);

  if (!raffle) {
    return res.status(404).json({ success: false, message: 'Raffle not found' });
  }

  // Calculate sold tickets from transactions
  const soldTickets = DB.transactions
    .filter(t => t.raffleId === id)
    .reduce((sum, transaction) => sum + transaction.quantity, 0);

  res.json({
    success: true,
    data: {
      soldTickets,
      totalTickets: raffle.totalTickets,
      remainingTickets: raffle.totalTickets - soldTickets,
    }
  });
});

// Get raffle by ID
app.get('/api/raffles/:id', (req, res) => {
  console.log(`GET /api/raffles/${req.params.id} requested`);
  const raffle = DB.raffles.find(r => r._id === req.params.id);
  
  if (!raffle) {
    return res.status(404).json({ success: false, message: 'Raffle not found' });
  }
  
  res.json(raffle);
});

// Create test raffle endpoint
app.get('/api/create-test-raffle', (req, res) => {
  console.log('GET /api/create-test-raffle requested');
  res.json({ success: true, message: 'Test raffle already exists', data: DB.raffles[0] });
});

// Purchase tickets endpoint
app.post('/api/tickets/purchase', upload.single('paymentProof'), (req, res) => {
  console.log('====== PURCHASE REQUEST DATA ======');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('File:', req.file ? req.file.filename : 'No file uploaded');
  
  // Extract and normalize data from request
  
  try {
    // Get buyer information
    let buyerName = '';
    
    // Check for different possible name field formats from frontend
    if (req.body.name) {
      buyerName = req.body.name;
    } else if (req.body.firstName && req.body.lastName) {
      buyerName = `${req.body.firstName} ${req.body.lastName}`;
    } else if (req.body.fullName) {
      buyerName = req.body.fullName;
    } else if (req.body.comprador) { 
      buyerName = req.body.comprador;
    }
    
    console.log(`Buyer name: ${buyerName}`);
    
    // Find or create participant
    let participant = DB.participants.find(p => p.email === req.body.email);
    
    if (!participant) {
      participant = {
        _id: 'participant_' + Date.now(),
        name: buyerName,
        email: req.body.email,
        phone: req.body.phone || '',
        country: req.body.country || 'Venezuela',
        city: req.body.city || '',
        whatsapp: req.body.whatsapp || req.body.phone || '',
        createdAt: new Date()
      };
      
      DB.participants.push(participant);
      console.log('Created new participant:', participant._id);
    } else {
      console.log('Found existing participant:', participant._id);
    }
    
    // Process payment proof if uploaded
    let paymentProofUrl = null;
    if (req.file) {
      // In standalone mode, we just store the URL
      paymentProofUrl = `http://localhost:5100/uploads/${path.basename(req.file.path)}`;
      console.log('Payment proof URL:', paymentProofUrl);
    }
    
    // Get payment method
    const paymentMethodRaw = req.body.paymentMethod || 'pago-movil';
    
    const quantity = parseInt(req.body.quantity) || 1;
    const raffleId = req.body.raffleId;
    
    // Get raffle
    const raffle = DB.raffles.find(r => r._id === raffleId);
    if (!raffle) {
      return res.status(404).json({ success: false, message: 'Raffle not found' });
    }
    
    console.log(`Found raffle: ${raffle.title}`);
    
    // Get the payment method to determine which price to use
    // Calculate total amount based on payment method
    let basePrice, currency, currencySymbol;
    if (paymentMethodRaw === 'zelle' || paymentMethodRaw === 'binance') {
      basePrice = raffle.ticketPriceUSD || 5;
      currency = 'USD';
      currencySymbol = '$';
    } else {
      basePrice = raffle.ticketPriceBS || 4000;
      currency = 'Bs';
      currencySymbol = 'Bs.';
    }
    
    const totalAmount = basePrice * quantity;
    console.log(`Ticket price: ${basePrice}, Quantity: ${quantity}, Total: ${totalAmount}`);
    
    // Generate random ticket numbers
    const ticketNumbers = [];
    
    for (let i = 0; i < quantity; i++) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      ticketNumbers.push(randomNum.toString());
    }
    
    // Create transaction
    console.log(`Payment amount: ${totalAmount} ${currency}`);
    
    const transaction = {
      _id: 'tx_' + Date.now(),
      raffleId: raffle._id,
      participant: {
        name: buyerName,  // Use normalized name for participant.name
        email: participant.email,
        phone: participant.phone,
        country: participant.country,
        city: participant.city,
        whatsapp: participant.whatsapp
      }, 
      participantId: participant._id, // Keep ID for reference
      comprador: buyerName, // Explicitly set comprador field
      tickets: ticketNumbers,
      quantity: quantity,
      totalAmount: totalAmount, // Amount based on payment method
      paymentAmount: totalAmount, // Payment amount
      paymentCurrency: currency, // Currency based on payment method
      paymentCurrencySymbol: currencySymbol,
      paymentMethod: paymentMethodRaw, // Use the payment method from form
      paymentReference: req.body.paymentReference || '1234',
      paymentProofUrl: paymentProofUrl,
      paymentProof: paymentProofUrl ? paymentProofUrl.replace('http://localhost:5100/', '') : null,
      status: 'pending',
      emailSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Transaction created:', transaction);
    
    DB.transactions.push(transaction);
    console.log('Created transaction:', transaction._id);
    
    // Create tickets
    ticketNumbers.forEach(number => {
      const ticket = {
        _id: 'ticket_' + Date.now() + '_' + number,
        number: number,
        raffleId: raffle._id,
        participantId: participant._id,
        transactionId: transaction._id,
        createdAt: new Date()
      };
      
      DB.tickets.push(ticket);
    });
    
    console.log(`Created ${quantity} tickets with numbers:`, ticketNumbers);
    
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

// Admin routes below

// Get all transactions (admin)
app.get('/api/admin/transactions', adminAuth, (req, res) => {
  console.log('GET /api/admin/transactions requested');
  
  // Return transactions with expanded participant info
  const expandedTransactions = DB.transactions.map(transaction => {
    const raffle = DB.raffles.find(r => r._id === transaction.raffleId);
    
    // Make sure we return with the structure frontend expects
    const expanded = {
      ...transaction,
      raffle: raffle,
      ticketCount: transaction.tickets.length,
      comprador: transaction.participant?.name || transaction.comprador || 'Cliente',
      paymentCurrency: transaction.paymentCurrency || raffle.currency || 'USD'
    };
    
    console.log('Expanded transaction:', expanded.comprador, expanded.paymentMethod, expanded.paymentAmount, expanded.paymentCurrency);
    return expanded;
  });
  
  res.json({ success: true, data: expandedTransactions });
});

// Get transaction by ID (admin)
app.get('/api/admin/transactions/:id', adminAuth, (req, res) => {
  console.log(`GET /api/admin/transactions/${req.params.id} requested`);
  
  const transaction = DB.transactions.find(t => t._id === req.params.id);
  
  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }
  
  const participant = DB.participants.find(p => p._id === transaction.participantId);
  const raffle = DB.raffles.find(r => r._id === transaction.raffleId);
  
  const expandedTransaction = {
    ...transaction,
    raffle: raffle,
    comprador: transaction.comprador || transaction.participant?.name || 'Cliente'
  };
  
  res.json({ success: true, data: expandedTransaction });
});

// Update transaction status (admin) - matches the frontend expectation
app.put('/api/admin/transactions/:id/status', adminAuth, (req, res) => {
  console.log(`PUT /api/admin/transactions/${req.params.id}/status requested`);
  
  const { status } = req.body;
  
  if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be 'pending', 'confirmed', or 'rejected'"
    });
  }
  
  const transaction = DB.transactions.find(t => t._id === req.params.id);
  
  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }
  
  transaction.status = status;
  transaction.updatedAt = new Date();
  
  // If status is confirmed and email hasn't been sent yet
  if (status === 'confirmed' && !transaction.emailSent) {
    const participant = DB.participants.find(p => p._id === transaction.participantId);
    const raffle = DB.raffles.find(r => r._id === transaction.raffleId);
    
    if (participant && participant.email) {
      // Would send email in a real system
      console.log(`🔔 SIMULATED EMAIL to ${participant.email}:`);
      console.log(`Subject: Your Raffle Tickets Have Been Confirmed`);
      console.log(`Body: Dear ${participant.name}, your tickets ${transaction.tickets.join(', ')} for ${raffle.title} have been confirmed!`);
      
      transaction.emailSent = true;
    }
  }
  
  res.json({ 
    success: true, 
    message: `Transaction status updated to ${status}`,
    data: transaction
  });
});

// Start server
const PORT = process.env.PORT || 5100;
app.listen(PORT, () => {
  console.log(`🚀 Standalone server running on http://localhost:${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/ping`);
  console.log(`Raffles endpoint: http://localhost:${PORT}/api/raffles/active`);
  console.log(`Admin endpoint: http://localhost:${PORT}/api/admin/transactions (requires x-admin-key header)`);
});
