const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  sendConfirmationEmailNow,
  processPendingEmails
} = require('../controllers/transactionController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Admin-only routes
router.get('/', protectAdmin, getAllTransactions);
router.get('/:id', protectAdmin, getTransactionById);
router.put('/:id/status', protectAdmin, updateTransactionStatus);
router.post('/:id/send-email', protectAdmin, sendConfirmationEmailNow);
router.post('/process-emails', protectAdmin, processPendingEmails);

module.exports = router;
