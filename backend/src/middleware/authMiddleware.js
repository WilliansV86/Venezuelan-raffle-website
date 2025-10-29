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
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
});

// Middleware to protect ADMIN routes. Verifies JWT and checks for admin ID.
const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Admin token received:', token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token ID:', decoded.id);

      // Check if the user is the specific admin user
      if (decoded.id === 'admin_user') {
        console.log('Admin authentication successful');
        req.user = { id: decoded.id }; // Attach user to the request
        next();
      } else {
        console.error('Admin authentication failed: Invalid ID', decoded.id);
        res.status(403).json({ message: 'Not authorized as an admin' });
      }
    } catch (error) {
      console.error('Admin authorization failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed or invalid' });
    }
  } else {
    console.error('Admin authorization failed: No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
});

// Middleware for routes that can be authenticated with either JWT token OR admin key
const protectAdminFlex = asyncHandler(async (req, res, next) => {
  console.log('===== protectAdminFlex called =====');
  console.log('Headers:', req.headers);
  console.log('Authorization:', req.headers.authorization);
  console.log('x-admin-key:', req.headers['x-admin-key']);
  
  // Check for Bearer token first
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      const token = req.headers.authorization.split(' ')[1];
      console.log('Admin token received:', token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token ID:', decoded.id);

      // Check if the user is the specific admin user
      if (decoded.id === 'admin_user') {
        console.log('Admin authentication successful via JWT');
        req.user = { id: decoded.id }; // Attach user to the request
        return next();
      } else {
        console.log('Token ID is not admin_user:', decoded.id);
      }
    } catch (error) {
      console.log('JWT validation failed:', error.message);
      console.log('Trying x-admin-key instead');
      // Continue to next auth method
    }
  } else {
    console.log('No valid Authorization header with Bearer token');
  }
  
  // If Bearer token auth failed, try x-admin-key
  const adminKey = req.headers['x-admin-key'];
  console.log('x-admin-key from request:', adminKey);
  console.log('Expected ADMIN_KEY:', process.env.ADMIN_KEY);
  console.log('Keys match:', adminKey === process.env.ADMIN_KEY);
  
  if (adminKey && adminKey === process.env.ADMIN_KEY) {
    console.log('Admin authentication successful via x-admin-key');
    req.user = { id: 'admin_user' }; // Set the same admin user ID
    return next();
  }
  
  // If we reach here, both auth methods failed
  console.error('Admin authorization failed: Invalid credentials');
  res.status(401).json({ message: 'Not authorized, invalid credentials' });
});

module.exports = { protect, protectAdmin, protectAdminFlex };
