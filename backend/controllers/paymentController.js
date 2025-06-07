// const PaymentProof = require('../models/PaymentProof');
// const Ticket = require('../models/Ticket');
// const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinaryConfig');

// @desc    Upload payment proof for a ticket
// @route   POST /api/payments/proof/:ticketId
// @access  Public (for the user who bought the ticket)
const uploadPaymentProof = (req, res) => {
  // Logic to:
  // 1. Get ticketId from params
  // 2. Get participant info (e.g., from authenticated user or form)
  // 3. Handle file upload to Cloudinary (req.file will be available from Multer)
  // 4. Create PaymentProof document in DB
  // 5. Link PaymentProof to the Ticket
  // 6. Update Ticket paymentStatus to 'pending' (if not already)
  // Access uploaded file details via req.file (e.g., req.file.path for Cloudinary URL, req.file.filename for public_id)
  // Access other form data via req.body
  console.log('Uploaded File:', req.file);
  console.log('Request Body:', req.body);
  res.json({ 
    message: 'uploadPaymentProof controller placeholder - file received',
    fileName: req.file ? req.file.filename : null,
    filePath: req.file ? req.file.path : null,
    originalName: req.file ? req.file.originalname : null,
    body: req.body
  });
};

// @desc    Verify or reject a payment (Admin only)
// @route   PUT /api/payments/verify/:ticketId (or :paymentProofId)
// @access  Admin
const verifyPayment = (req, res) => {
  // Logic to:
  // 1. Get ticketId (or paymentProofId) from params
  // 2. Get verification status (verified/rejected) and admin notes from body
  // 3. Update PaymentProof status
  // 4. Update corresponding Ticket paymentStatus
  res.json({ message: 'verifyPayment controller placeholder (admin only)' });
};

module.exports = {
  uploadPaymentProof,
  verifyPayment,
};
