const express = require('express');
const router = express.Router();
const {
  createRaffle,
  getAllRaffles,
  getActiveRaffles,
  getPastRaffles,
  getRaffleById,
  updateRaffle,
  activateRaffle,
  completeRaffle
} = require('../controllers/raffleController');

// Middleware for admin authentication (to be implemented)
const { protectAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/active', getActiveRaffles); // Must be before /:id
router.get('/past', getPastRaffles); // Must be before /:id
router.get('/', getAllRaffles);
router.get('/:id', getRaffleById);

// Admin-only routes
router.post('/', protectAdmin, createRaffle);
router.put('/:id', protectAdmin, updateRaffle);
router.put('/:id/activate', protectAdmin, activateRaffle);
router.put('/:id/complete', protectAdmin, completeRaffle);

module.exports = router;
