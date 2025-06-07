const express = require('express');
const router = express.Router();
// const { uploadPaymentProof, verifyPayment } = require('../controllers/paymentController');
// const { protect, admin } = require('../middleware/authMiddleware'); // We'll create this later
const { upload } = require('../config/multerCloudinary');

// POST /api/payment/proof/:ticketId (or participantId, TBD based on flow)
// Assuming :id refers to the ticket for which proof is being uploaded
router.post('/proof/:ticketId', upload.single('paymentProofImage'), (req, res) => {
  // console.log(req.file); // Information about uploaded file by Multer
  res.json({ message: `POST payment proof for ticket ${req.params.ticketId} - placeholder` });
});

// PUT /api/payment/verify/:ticketId (or paymentProofId, TBD)
// Assuming :id refers to the ticket whose payment is being verified
router.put('/verify/:ticketId', /* protect, admin, */ (req, res) => {
  res.json({ message: `PUT verify payment for ticket ${req.params.ticketId} - placeholder (admin only)` });
});

// Example routes (we will implement controllers and middleware later)
// router.post('/proof/:ticketId', upload.single('paymentProofImage'), uploadPaymentProof); // Controller will be implemented later
// router.put('/verify/:ticketId', protect, admin, verifyPayment);

module.exports = router;
