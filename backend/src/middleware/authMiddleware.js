const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

// Middleware to protect routes by verifying JWT (for any logged-in user)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to protect ADMIN routes. Verifies JWT and checks for admin ID.
const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if the user is the specific admin user
      if (decoded.id === 'admin_user') {
        req.user = { id: decoded.id }; // Attach user to the request
        next();
      } else {
        res.status(403); // 403 Forbidden - user is authenticated but not an admin
        throw new Error('Not authorized as an admin');
      }
    } catch (error) {
      console.error('Admin authorization failed:', error.message);
      res.status(401); // 401 Unauthorized
      throw new Error('Not authorized, token failed or invalid');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect, protectAdmin };
