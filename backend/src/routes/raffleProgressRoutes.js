const express = require('express');
const router = express.Router();
const { updateRaffleProgress } = require('../controllers/raffleProgressController');
const { protectAdminFlex } = require('../middleware/authMiddleware');

// PUT /api/raffles/:id/display-progress
router.put('/:id/display-progress', protectAdminFlex, updateRaffleProgress);

module.exports = router;
