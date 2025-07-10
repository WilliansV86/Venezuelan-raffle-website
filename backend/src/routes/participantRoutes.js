const express = require('express');
const router = express.Router();
const {
  getAllParticipants,
  getParticipantById,
  getParticipantByEmail
} = require('../controllers/participantController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public route for ticket verification
router.get('/email/:email', getParticipantByEmail);

// Admin-only routes
router.get('/', protectAdmin, getAllParticipants);
router.get('/:id', protectAdmin, getParticipantById);

module.exports = router;
