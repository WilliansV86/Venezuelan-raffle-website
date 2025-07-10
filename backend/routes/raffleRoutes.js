const express = require('express');
const router = express.Router();
const {
  getAllRaffles,
  createRaffle,
  getRaffleById,
  updateRaffle,
  deleteRaffle,
  getPastRaffles
} = require('../controllers/raffleController');
const { isAdmin } = require('../middleware/authMiddleware');

// General routes - getAllRaffles already filters for active raffles
router.route('/').get(getAllRaffles).post(isAdmin, createRaffle);

// Active raffles route - using getAllRaffles since it already filters for active raffles
router.route('/active').get(getAllRaffles);

// Past raffles route - for completed raffles with winners
router.route('/past').get(getPastRaffles);

// Individual raffle route
router
  .route('/:id')
  .get(getRaffleById)
  .put(isAdmin, updateRaffle)
  .delete(isAdmin, deleteRaffle);

module.exports = router;
