const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig'); // Your configured Cloudinary instance

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and filename for Cloudinary
    // For example, store proofs in a 'raffle_proofs' folder
    // You might want to include participantId or ticketId in the filename for uniqueness
    let folder = 'raffle_proofs';
    if (req.params.ticketId) {
      folder = `raffle_proofs/tickets/${req.params.ticketId}`;
    }
    // Generate a unique filename (Cloudinary handles this well by default if not specified)
    // const fileName = `${Date.now()}-${file.originalname}`;

    return {
      folder: folder,
      // public_id: fileName, // Optional: specify a public_id
      allowed_formats: ['jpeg', 'jpg', 'png'], // Allowed image formats
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Optional: resize images
    };
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only jpeg, jpg, png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido. Solo se permiten JPG, JPEG y PNG.'), false);
    }
  },
});

module.exports = { upload };
