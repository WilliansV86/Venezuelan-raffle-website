const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local path to the file
 * @param {Object} options - Upload options
 * @returns {Promise} - Resolves to Cloudinary upload response
 */
const uploadToCloudinary = async (filePath, options = {}) => {
  // Set default options
  const uploadOptions = {
    folder: 'payment_screenshots',
    resource_type: 'auto',
    ...options
  };
  
  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    return result;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};
