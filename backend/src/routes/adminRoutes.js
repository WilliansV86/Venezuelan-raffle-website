const express = require('express');
const router = express.Router();
const { authAdmin, getAdminRaffles, getAdminTransactions, verifyAdminKey } = require('../controllers/adminController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.post('/login', authAdmin);
router.post('/verify', verifyAdminKey);
router.get('/raffles', protect, admin, getAdminRaffles);
router.get('/transactions', protect, admin, getAdminTransactions);

module.exports = router;
