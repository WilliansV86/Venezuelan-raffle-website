const express = require('express');
const router = express.Router();
const { authAdmin, getAdminRaffles, getAdminTransactions, verifyAdminKey } = require('../controllers/adminController.js');
const { protectAdmin } = require('../middleware/authMiddleware.js');

router.post('/login', authAdmin);
router.post('/verify', verifyAdminKey);
router.get('/raffles', protectAdmin, getAdminRaffles);
router.get('/transactions', protectAdmin, getAdminTransactions);

module.exports = router;
