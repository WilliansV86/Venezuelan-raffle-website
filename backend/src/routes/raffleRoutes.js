const express = require('express');
const router = express.Router();
const { getRaffles, getRaffleById, createRaffle, updateRaffle, updateRaffleStatus, getPastRaffles } = require('../controllers/raffleController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');
const { upload } = require('../middleware/uploadMiddleware.js');

// Root route - get active raffles / create new raffle
router.route('/')
  .get(getRaffles)
  .post(protect, admin, upload.single('image'), createRaffle);

// IMPORTANT: Fixed routes must come BEFORE parametric routes
// Get completed raffles
router.get('/past', getPastRaffles);

// Parametric routes - handle these after the fixed routes
router.route('/:id')
  .get(getRaffleById)
  .put(protect, admin, upload.single('image'), updateRaffle);

// Update raffle status
router.route('/:id/status')
  .put(protect, admin, updateRaffleStatus);

module.exports = router;
