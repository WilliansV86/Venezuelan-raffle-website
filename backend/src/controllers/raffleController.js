const asyncHandler = require('express-async-handler');
const path = require('path');
const Raffle = require('../models/Raffle.js');

// @desc    Fetch all active raffles
// @route   GET /api/raffles
// @access  Public
const getRaffles = asyncHandler(async (req, res) => {
  try {
    // Filter to only return active raffles for the public homepage
    console.log('[getRaffles] Attempting to fetch raffles from database...');
    
    // Log all raffles to debug status issues
    const allRaffles = await Raffle.find({}).lean();
    console.log('[getRaffles] All raffles in database:', allRaffles.map(r => ({ 
      id: r._id, 
      title: r.title || r.name, 
      status: r.status 
    })));
    
    // Use lean() for better performance with case-insensitive status comparison
    // This will match 'active', 'Active', etc.
    const raffles = await Raffle.find({ 
      $or: [
        { status: 'active' }, 
        { status: 'Active' },
        { status: 'ACTIVE' }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();
      
    console.log('[getRaffles] Database query completed.');
    console.log('Active raffles count:', raffles.length);
    if (raffles.length > 0) {
      console.log('First active raffle:', { 
        id: raffles[0]._id, 
        title: raffles[0].title || raffles[0].name, 
        status: raffles[0].status 
      });
    }
    
    // Always return a consistent format, even if no raffles are found
    return res.json({
      success: true,
      data: raffles || [] // Ensure we always return an array
    });
  } catch (error) {
    console.error('Error fetching active raffles:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cargar los sorteos activos',
      error: error.message
    });
  }
});

// @desc    Fetch single raffle
// @route   GET /api/raffles/:id
// @access  Public
const getRaffleById = asyncHandler(async (req, res) => {
  const raffle = await Raffle.findById(req.params.id);

  if (raffle) {
    res.json(raffle);
  } else {
    res.status(404).json({ success: false, message: 'Raffle not found' });
  }
});

// @desc    Create a raffle
// @route   POST /api/raffles
// @access  Private/Admin
const createRaffle = asyncHandler(async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Check for required fields
    if (!req.body.name || !req.body.price || !req.body.maxTickets || !req.body.drawDate) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos. Asegúrese de incluir: nombre, precio, máximo de tickets, y fecha del sorteo.' 
      });
    }
    
    // Handle the image (from file upload or URL)
    let imagePath = '';
    
    // If a file was uploaded, use that instead
    if (req.file) {
      // Create a path that can be accessed from the frontend
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      // Use the image URL provided in the form
      imagePath = req.body.image;
    } else {
      return res.status(400).json({ message: 'Se requiere una imagen para la rifa' });
    }
    
    // Create the raffle with properly typed values
    const raffle = new Raffle({
      name: req.body.name,
      description: req.body.description || '',
      price: Number(req.body.price), 
      priceBS: Number(req.body.priceBS || 0),
      maxTickets: Number(req.body.maxTickets),
      drawDate: req.body.drawDate,
      image: imagePath,
      status: 'draft'
    });

    const createdRaffle = await raffle.save();
    res.status(201).json(createdRaffle);
  } catch (error) {
    console.error('Error creating raffle:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a raffle
// @route   PUT /api/raffles/:id
// @access  Private/Admin
const updateRaffle = asyncHandler(async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Update request file:', req.file);
    
    // Extract fields directly from request body using model field names
    const { name, description, price, priceBS, maxTickets, drawDate, status } = req.body;
    
    // Find raffle by ID
    const raffle = await Raffle.findById(req.params.id);

    if (raffle) {
      // Handle the image (from file upload or URL)
      let imagePath = req.body.image || raffle.image; // Keep existing image if none provided
      
      // If a file was uploaded, use that instead
      if (req.file) {
        // Create a path that can be accessed from the frontend
        imagePath = `/uploads/${req.file.filename}`;
      }

      // Update raffle properties
      if (name) raffle.name = name;
      if (description) raffle.description = description;
      if (price !== undefined) raffle.price = Number(price);
      if (priceBS !== undefined) raffle.priceBS = Number(priceBS); // Allow 0 value
      if (maxTickets) raffle.maxTickets = Number(maxTickets);
      if (drawDate) raffle.drawDate = drawDate;
      raffle.image = imagePath;
      if (status) raffle.status = status;

      const updatedRaffle = await raffle.save();
      res.json(updatedRaffle);
    } else {
      res.status(404).json({ success: false, message: 'Raffle not found' });
    }
  } catch (error) {
    console.error('Error updating raffle:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update raffle status
// @route   PUT /api/raffles/:id/status
// @access  Private/Admin
const updateRaffleStatus = asyncHandler(async (req, res) => {
  console.log('updateRaffleStatus called with params:', req.params);
  console.log('updateRaffleStatus request body:', req.body);
  console.log('updateRaffleStatus auth header:', req.headers.authorization);
  
  try {
    const { status } = req.body;
    console.log('Status from request:', status);
      
    if (!status || !['draft', 'active', 'completed'].includes(status)) {
      console.log('Invalid status:', status);
      res.status(400).json({
        message: 'Estado inválido. Debe ser: draft, active, o completed.'
      });
      return;
    }
    
    console.log('Finding raffle with ID:', req.params.id);
    const updatedRaffle = await Raffle.findByIdAndUpdate(
      req.params.id,
      { status: status }, // Only update the status field
      { new: true, runValidators: false } // IMPORTANT: Do not run validators on other fields
    );
    console.log('Result from findByIdAndUpdate:', updatedRaffle);

    if (!updatedRaffle) {
      console.log('Raffle not found with ID:', req.params.id);
      res.status(404).json({
        message: 'Rifa no encontrada'
      });
      return;
    }

    console.log('Successfully updated raffle status to:', status);
    res.json(updatedRaffle);
  } catch (error) {
    console.error('Error in updateRaffleStatus:', error);
    res.status(500).json({
      message: 'Error al actualizar el estado de la rifa',
      error: error.message
    });
  }
});

// @desc    Fetch past (completed) raffles
// @route   GET /api/raffles/past
// @access  Public
const getPastRaffles = asyncHandler(async (req, res) => {
  try {
    console.log('[getPastRaffles] Request received');
    // Filter to only return completed raffles, sorted by most recent first
    console.log('[getPastRaffles] Attempting to fetch completed raffles from database...');
    
    // Use lean() for better performance
    const pastRaffles = await Raffle.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .lean();
      
    console.log('[getPastRaffles] Database query completed.');
    console.log('Past raffles count:', pastRaffles.length);
    
    // Always return a consistent format, even if no raffles are found
    console.log('[getPastRaffles] Sending response with past raffles');
    return res.json({
      success: true,
      data: pastRaffles || [] // Ensure we always return an array
    });
  } catch (error) {
    console.error('[getPastRaffles] Error fetching past raffles:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cargar los sorteos completados',
      error: error.message
    });
  }
});

// @desc    Delete a raffle
// @route   DELETE /api/raffles/:id
// @access  Private/Admin
const deleteRaffle = asyncHandler(async (req, res) => {
  console.log('[deleteRaffle] Attempting to delete raffle with ID:', req.params.id);
  
  try {
    const raffle = await Raffle.findById(req.params.id);
    
    if (!raffle) {
      console.log('[deleteRaffle] Raffle not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Rifa no encontrada'
      });
    }
    
    await Raffle.findByIdAndDelete(req.params.id);
    console.log('[deleteRaffle] Successfully deleted raffle with ID:', req.params.id);
    
    return res.json({
      success: true,
      message: 'Rifa eliminada exitosamente'
    });
  } catch (error) {
    console.error('[deleteRaffle] Error deleting raffle:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar la rifa',
      error: error.message
    });
  }
});

// @desc    Get raffle ticket statistics
// @route   GET /api/raffles/:id/stats
// @access  Public
const getRaffleStats = asyncHandler(async (req, res) => {
  try {
    const raffle = await Raffle.findById(req.params.id);
    
    if (!raffle) {
      return res.status(404).json({
        success: false,
        message: 'Raffle not found'
      });
    }
    
    // Calculate stats
    const totalTickets = raffle.maxTickets || 0;
    const soldTickets = raffle.ticketsSold || 0;
    const remainingTickets = Math.max(0, totalTickets - soldTickets);
    const soldPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
    const remainingPercentage = totalTickets > 0 ? (remainingTickets / totalTickets) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        totalTickets,
        soldTickets,
        remainingTickets,
        soldPercentage: parseFloat(soldPercentage.toFixed(2)),
        remainingPercentage: parseFloat(remainingPercentage.toFixed(2)),
        status: raffle.status,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error getting raffle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del sorteo',
      error: error.message
    });
  }
});

module.exports = {
  getRaffles,
  getRaffleById,
  createRaffle,
  updateRaffle,
  updateRaffleStatus,
  getPastRaffles,
  deleteRaffle,
  getRaffleStats
};
