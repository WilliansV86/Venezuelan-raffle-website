const express = require('express');
const router = express.Router();
const { authAdmin, getAdminRaffles, createRaffle, getAdminTransactions, verifyAdminKey, updateTransactionStatus, clearTransactions } = require('../controllers/adminController.js');
const { protectAdmin } = require('../middleware/authMiddleware.js');

router.post('/login', authAdmin);
router.post('/verify', verifyAdminKey);

// Raffle management
router.route('/raffles')
  .get(protectAdmin, getAdminRaffles)
  .post(protectAdmin, createRaffle);

// Transaction management
router.get('/transactions', protectAdmin, getAdminTransactions);
router.route('/transactions/:id/status').patch(protectAdmin, updateTransactionStatus);
router.delete('/transactions/clear', protectAdmin, clearTransactions);

module.exports = router;
