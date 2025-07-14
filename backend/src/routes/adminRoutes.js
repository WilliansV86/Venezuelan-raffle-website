const express = require('express');
const router = express.Router();
const { authAdmin, getAdminRaffles, createRaffle, getAdminTransactions, verifyAdminKey } = require('../controllers/adminController.js');
const { protectAdmin } = require('../middleware/authMiddleware.js');

router.post('/login', authAdmin);
router.post('/verify', verifyAdminKey);

// Raffle management
router.route('/raffles')
  .get(protectAdmin, getAdminRaffles)
  .post(protectAdmin, createRaffle);

router.get('/transactions', protectAdmin, getAdminTransactions);

module.exports = router;
