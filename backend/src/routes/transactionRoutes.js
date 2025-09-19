const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  createTransaction,
  getTransactionById,
  updateTransactionStatus,
  confirmTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// Public route to create a transaction (with file upload)
// Admin route to get all transactions
router.route('/')
  .post(upload.single('paymentScreenshot'), createTransaction)
  .get(protect, getAllTransactions);

// Admin routes for a single transaction
router.route('/:id')
  .get(protect, getTransactionById);

router.route('/:id/status')
  .put(protect, updateTransactionStatus);

router.route('/:id/confirm')
  .put(protect, confirmTransaction);

module.exports = router;
