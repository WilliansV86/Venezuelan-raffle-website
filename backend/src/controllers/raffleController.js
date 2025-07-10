const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Raffle = require('../models/Raffle');
const ticketGenerator = require('../utils/ticketGenerator');

/**
 * Create a new raffle
 * @route POST /api/raffles
 * @access Private (admin only)
 */
const createRaffle = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    imageUrl,
    ticketPrice,
    currencyCode,
    exchangeRate,
    startDate,
    endDate,
    drawDate,
    maxTickets,
    minTicketsPerPurchase,
    prize
  } = req.body;

  // Validate required fields
  if (!title || !description || !imageUrl || !ticketPrice || 
      !startDate || !endDate || !drawDate || !prize) {
    res.status(400);
    throw new Error('Por favor complete todos los campos requeridos');
  }

  // Create the raffle
  const raffle = await Raffle.create({
    title,
    description,
    imageUrl,
    ticketPrice,
    currencyCode: currencyCode || 'USD',
    exchangeRate: exchangeRate || 160,
    startDate,
    endDate,
    drawDate,
    maxTickets: maxTickets || 10000,
    minTicketsPerPurchase: minTicketsPerPurchase || {
      'pago-movil': 2,
      'zelle': 10,
      'binance': 10
    },
    status: 'draft',
    prize
  });

  res.status(201).json({
    success: true,
    data: raffle
  });
});

/**
 * Get all raffles
 * @route GET /api/raffles
 * @access Public
 */
const getAllRaffles = asyncHandler(async (req, res) => {
  const raffles = await Raffle.find({}).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: raffles.length,
    data: raffles
  });
});

/**
 * Get active raffles
 * @route GET /api/raffles/active
 * @access Public
 */
/**
 * @desc    Get all active raffles
 * @route   GET /api/raffles/active
 * @access  Public
 */
const getActiveRaffles = asyncHandler(async (req, res) => {
  const MAX_RETRIES = 3;
  let retryCount = 0;
  let lastError = null;

  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retryCount + 1} to fetch active raffles...`);
      
      // Check if the connection is ready
      if (!mongoose.connection || mongoose.connection.readyState !== 1) {
        console.warn('MongoDB connection not ready. Current state:', 
          mongoose.connection ? mongoose.connection.readyState : 'no connection');
        
        // Try to reconnect if not connected
        const { connectDB } = require('../../config/db');
        try {
          await connectDB();
          
          // Wait for the connection to be ready
          const { waitForConnection } = require('../../config/db');
          const isReady = await waitForConnection(5000); // 5 second timeout
          
          if (!isReady) {
            throw new Error('MongoDB connection is not ready after timeout');
          }
        } catch (dbError) {
          console.error(`Attempt ${retryCount + 1} failed to connect to MongoDB:`, dbError);
          lastError = dbError;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
          continue;
        }
      }
      
      // Check if the Raffle model is registered
      if (!mongoose.models.Raffle) {
        console.error('Raffle model is not registered!');
        throw new Error('Database model not initialized');
      }
      
      // Execute the query
      const raffles = await Raffle.find({ status: 'active' })
        .sort({ endDate: 1 })
        .lean() // Convert to plain JavaScript objects for better performance
        .maxTimeMS(10000); // 10 second timeout for the query
      
      console.log(`Successfully found ${raffles.length} active raffles`);
      
      return res.json({
        success: true,
        count: raffles.length,
        data: raffles
      });
      
    } catch (error) {
      console.error(`Error in getActiveRaffles (attempt ${retryCount + 1}):`, error);
      lastError = error;
      retryCount++;
      
      if (retryCount < MAX_RETRIES) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }
  
  // If we get here, all retries failed
  const errorInfo = {
    message: lastError?.message || 'Failed to fetch active raffles',
    name: lastError?.name || 'DatabaseError',
    code: lastError?.code,
    errorState: mongoose.connection ? mongoose.connection.readyState : 'no connection',
    time: new Date().toISOString(),
    retries: retryCount
  };
  
  console.error('All retries failed. Error details:', JSON.stringify(errorInfo, null, 2));
  
  res.status(500).json({
    success: false,
    message: 'Failed to fetch active raffles after multiple attempts',
    error: process.env.NODE_ENV === 'development' ? errorInfo : undefined
  });
});

/**
 * Get a single raffle
 * @route GET /api/raffles/:id
 * @access Public
 */
const getRaffleById = asyncHandler(async (req, res) => {
  const raffle = await Raffle.findById(req.params.id);
  
  if (!raffle) {
    res.status(404);
    throw new Error('Sorteo no encontrado');
  }
  
  res.json({
    success: true,
    data: raffle
  });
});

/**
 * Update a raffle
 * @route PUT /api/raffles/:id
 * @access Private (admin only)
 */
const updateRaffle = asyncHandler(async (req, res) => {
  let raffle = await Raffle.findById(req.params.id);
  
  if (!raffle) {
    res.status(404);
    throw new Error('Sorteo no encontrado');
  }
  
  // Update raffle
  raffle = await Raffle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.json({
    success: true,
    data: raffle
  });
});

/**
 * Activate a raffle
 * @route PUT /api/raffles/:id/activate
 * @access Private (admin only)
 */
const activateRaffle = asyncHandler(async (req, res) => {
  const raffle = await Raffle.findById(req.params.id);
  
  if (!raffle) {
    res.status(404);
    throw new Error('Sorteo no encontrado');
  }
  
  if (raffle.status === 'active') {
    res.status(400);
    throw new Error('El sorteo ya está activo');
  }
  
  // Generate tickets for this raffle
  try {
    const ticketsCount = await ticketGenerator.generateTicketsForRaffle(raffle._id);
    console.log(`Generated ${ticketsCount} tickets for raffle ${raffle._id}`);
    
    // Update raffle status
    raffle.status = 'active';
    await raffle.save();
    
    res.json({
      success: true,
      message: `Sorteo activado con éxito. ${ticketsCount} tickets generados.`,
      data: raffle
    });
  } catch (error) {
    console.error('Error activating raffle:', error);
    res.status(500);
    throw new Error(`Error al activar el sorteo: ${error.message}`);
  }
});

/**
 * Complete a raffle
 * @route PUT /api/raffles/:id/complete
 * @access Private (admin only)
 */
const completeRaffle = asyncHandler(async (req, res) => {
  const raffle = await Raffle.findById(req.params.id);
  
  if (!raffle) {
    res.status(404);
    throw new Error('Sorteo no encontrado');
  }
  
  if (raffle.status !== 'active') {
    res.status(400);
    throw new Error(`No se puede completar un sorteo en estado: ${raffle.status}`);
  }
  
  // Update raffle status
  raffle.status = 'completed';
  await raffle.save();
  
  res.json({
    success: true,
    message: 'Sorteo completado con éxito',
    data: raffle
  });
});

const getPastRaffles = asyncHandler(async (req, res) => {
  const raffles = await Raffle.find({ status: 'completed' }).sort({ endDate: -1 });
  res.json({ success: true, count: raffles.length, data: raffles });
});

module.exports = {
  createRaffle,
  getAllRaffles,
  getActiveRaffles,
  getPastRaffles,
  getRaffleById,
  updateRaffle,
  activateRaffle,
  completeRaffle
};
