const asyncHandler = require('express-async-handler');

// @desc    Admin authentication middleware
// @access  Private (Admin)
const isAdmin = asyncHandler(async (req, res, next) => {
  let adminKey;

  // Check for admin key in headers (e.g., 'x-admin-key')
  if (req.headers['x-admin-key']) {
    adminKey = req.headers['x-admin-key'];
  }
  // Alternatively, check in query parameters (e.g., '?adminKey=YOUR_SECRET_KEY')
  // else if (req.query.adminKey) {
  //   adminKey = req.query.adminKey;
  // }

  // IMPORTANT: Replace 'YOUR_SECRET_ADMIN_KEY' with a strong, unique key
  // and ideally store it in an environment variable (e.g., process.env.ADMIN_KEY)
  const SECRET_ADMIN_KEY = process.env.ADMIN_KEY || 'YOUR_SECRET_ADMIN_KEY_PLACEHOLDER';

  if (adminKey && adminKey === SECRET_ADMIN_KEY) {
    // User is admin, proceed to the next middleware or route handler
    next();
  } else {
    res.status(401); // Unauthorized
    throw new Error('Not authorized as an admin.');
  }
});

module.exports = { isAdmin };
