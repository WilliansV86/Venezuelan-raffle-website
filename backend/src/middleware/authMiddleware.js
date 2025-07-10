/**
 * Authentication middleware for protecting admin routes
 */

const asyncHandler = require('express-async-handler');

// Simple admin key authentication
// In a production environment, you would want to use JWT tokens
// or another more secure authentication method
const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;
  
  // Get token from header - support both x-admin-key and Authorization Bearer token
  if (req.headers['x-admin-key']) {
    // Use x-admin-key header directly
    token = req.headers['x-admin-key'];
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Use Bearer token
    token = req.headers.authorization.split(' ')[1];
  }
  
  try {
    // Verify token matches admin key
    if (token && token === process.env.ADMIN_KEY) {
      // Token valid, proceed to next middleware
      next();
    } else {
      res.status(401);
      throw new Error('No autorizado, clave de administrador inválida');
    }
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401);
    throw new Error('No autorizado, error de autenticación');
  }
});

module.exports = {
  protectAdmin
};
