/**
 * Rate Limiter Middleware
 * 
 * Protects the API from abuse by limiting request rates
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Standard API rate limiter
 * Limits each IP to 100 requests per 15 minutes
 */
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests, please try again later.',
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
      headers: req.headers,
      ip: req.ip
    });
    res.status(options.statusCode).send(options.message);
  }
});

/**
 * Auth endpoint rate limiter
 * More strict limits for authentication-related endpoints
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login requests per hour
  message: 'Too many login attempts, please try again after an hour',
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    res.status(options.statusCode).send(options.message);
  }
});

/**
 * Health check endpoint rate limiter
 * More permissive for monitoring tools
 */
const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many health check requests'
});

module.exports = {
  standardLimiter,
  authLimiter,
  healthCheckLimiter
};
