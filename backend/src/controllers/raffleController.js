const asyncHandler = require('express-async-handler');
const path = require('path');
const Raffle = require('../models/Raffle.js');

// @desc    Fetch all active raffles
// @route   GET /api/raffles
// @access  Public
const getRaffles = asyncHandler(async (req, res) => {
  try {
    // Filter to only return active raffles for the public homepage
    const raffles = await Raffle.find({ status: 'active' }).sort({ createdAt: -1 });
    
    // Log the results for debugging
    console.log('Returning active raffles:', JSON.stringify(raffles, null, 2));
    console.log('Active raffles count:', raffles.length);
    
    // Always return a consistent format
    return res.json({
      success: true,
      data: raffles
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
      if (price) raffle.price = Number(price);
      if (priceBS) raffle.priceBS = Number(priceBS);
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
  try {
    const { status } = req.body;
    
    if (!status || !['draft', 'active', 'completed'].includes(status)) {
      return res.status(400).json({
        message: 'Estado inválido. Debe ser: draft, active, o completed.'
      });
    }
    
    const raffle = await Raffle.findById(req.params.id);
    
    if (!raffle) {
      return res.status(404).json({
        message: 'Rifa no encontrada'
      });
    }
    
    // Update the status
    raffle.status = status;
    
    const updatedRaffle = await raffle.save();
    
    res.json(updatedRaffle);
  } catch (error) {
    console.error('Error updating raffle status:', error);
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
    // Filter to only return completed raffles, sorted by most recent first
    const pastRaffles = await Raffle.find({ status: 'completed' }).sort({ createdAt: -1 });
    
    // Log the results for debugging
    console.log('Returning past raffles:', JSON.stringify(pastRaffles, null, 2));
    console.log('Past raffles count:', pastRaffles.length);
    
    // Always return a consistent format
    return res.json({
      success: true,
      data: pastRaffles
    });
  } catch (error) {
    console.error('Error fetching past raffles:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cargar los sorteos completados',
      error: error.message
    });
  }
});

module.exports = { getRaffles, getRaffleById, createRaffle, updateRaffle, updateRaffleStatus, getPastRaffles };
