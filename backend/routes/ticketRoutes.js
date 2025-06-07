const express = require('express');
const router = express.Router();
// const { getAllTickets } = require('../controllers/ticketController');

// GET /api/tickets: List all tickets + status
router.get('/', (req, res) => res.json({ message: 'GET all tickets with status - placeholder' }));

// Example route (we will implement controller later)
// router.route('/').get(getAllTickets);

module.exports = router;
