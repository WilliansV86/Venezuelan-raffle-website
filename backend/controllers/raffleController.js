const Raffle = require('../models/Raffle');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all raffles
// @route   GET /api/raffles
// @access  Public
const getAllRaffles = asyncHandler(async (req, res) => {
  // Fetch active raffles, perhaps sorted by end date or creation date
  const raffles = await Raffle.find({ isActive: true }).sort({ endDate: 1 });
  res.json(raffles);
});

// @desc    Create a new raffle
// @route   POST /api/raffles
// @access  Admin (to be implemented)
const createRaffle = asyncHandler(async (req, res) => {
  const { title, description, prize, ticketPrice, totalTickets, endDate, prizeImageUrl } = req.body;

  // Basic validation (Mongoose will also validate based on schema)
  if (!title || !description || !prize || !ticketPrice || !totalTickets || !endDate) {
    res.status(400);
    throw new Error('Por favor, completa todos los campos obligatorios.');
  }

  const raffle = new Raffle({
    title,
    description,
    prize,
    ticketPrice,
    totalTickets,
    endDate,
    // prizeImageUrl, // Uncomment if you add this to the model and request
  });

  const createdRaffle = await raffle.save();
  res.status(201).json(createdRaffle);
});

// @desc    Get single raffle by ID
// @route   GET /api/raffles/:id
// @access  Public
const getRaffleById = asyncHandler(async (req, res) => {
  const raffle = await Raffle.findById(req.params.id);

  if (raffle) {
    res.json(raffle);
  } else {
    res.status(404);
    throw new Error('Rifa no encontrada');
  }
});

// Add other controller functions like updateRaffle, deleteRaffle as needed

module.exports = {
  getAllRaffles,
  createRaffle,
  getRaffleById,
};
