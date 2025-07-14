const express = require('express');
const router = express.Router();
const { getRaffles, getRaffleById, createRaffle, updateRaffle, updateRaffleStatus, getPastRaffles } = require('../controllers/raffleController.js');
const { protectAdmin } = require('../middleware/authMiddleware.js');
const { upload } = require('../middleware/uploadMiddleware.js');

// Root route - get active raffles / create new raffle
router.route('/')
  .get(getRaffles)
  .post(protectAdmin, upload.single('image'), createRaffle);

// IMPORTANT: Fixed routes must come BEFORE parametric routes
// Get completed raffles
router.get('/past', getPastRaffles);

// Parametric routes - handle these after the fixed routes
router.route('/:id')
  .get(getRaffleById)
  .put(protectAdmin, upload.single('image'), updateRaffle);

// Update raffle status
router.route('/:id/status')
  .put(protectAdmin, updateRaffleStatus);

module.exports = router;
