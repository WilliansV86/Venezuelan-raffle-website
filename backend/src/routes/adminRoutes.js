const express = require('express');
const router = express.Router();
const { authAdmin, getAdminRaffles, createRaffle, getAdminTransactions, verifyAdminKey, updateTransactionStatus } = require('../controllers/adminController.js');
const { protectAdmin } = require('../middleware/authMiddleware.js');

router.post('/login', authAdmin);
router.post('/verify', verifyAdminKey);

// Raffle management
router.route('/raffles')
  .get(protectAdmin, getAdminRaffles)
  .post(protectAdmin, createRaffle);

router.get('/transactions', protectAdmin, getAdminTransactions);

router.route('/transactions/:id/status').patch(protectAdmin, updateTransactionStatus);

module.exports = router;
