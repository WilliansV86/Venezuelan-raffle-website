const express = require('express');
const router = express.Router();
const { getParticipantById } = require('../controllers/participantController');
const { protect } = require('../middleware/authMiddleware');

// This is a placeholder route to prevent server crashes.
router.route('/:id').get(protect, getParticipantById);

module.exports = router;
