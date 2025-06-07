const express = require('express');
const router = express.Router();
const {
  getAllRaffles,
  createRaffle,
  getRaffleById,
  updateRaffle, // Assuming updateRaffle will be created in controller
  deleteRaffle  // Assuming deleteRaffle will be created in controller
} = require('../controllers/raffleController');
const { isAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getAllRaffles).post(isAdmin, createRaffle); // Protect POST route

router
  .route('/:id')
  .get(getRaffleById)
  .put(isAdmin, updateRaffle) // Protect PUT route
  .delete(isAdmin, deleteRaffle); // Protect DELETE route

module.exports = router;
