const express = require('express');
const router = express.Router();
const multer = require('multer');
const { purchaseTickets, verifyTicket, storage } = require('../controllers/ticketController');

// Setup multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Solo se permiten imágenes'), false);
    }
    cb(null, true);
  }
});

// Routes
router.post('/purchase', upload.single('paymentProof'), purchaseTickets);
router.post('/verify', verifyTicket);

module.exports = router;
