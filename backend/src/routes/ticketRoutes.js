const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { 
  purchaseTickets, 
  getRaffleStats, 
  checkAvailability, 
  verifyTickets 
} = require('../controllers/ticketController');

// Configure cloudinary for payment proof uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup multer storage with cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'raffle-payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/purchase', upload.single('paymentProof'), purchaseTickets);
router.get('/stats/:raffleId', getRaffleStats);
router.get('/available/:raffleId/:count', checkAvailability);
router.get('/verify/:email', verifyTickets);

module.exports = router;
