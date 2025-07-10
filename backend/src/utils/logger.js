/**
 * Production-Ready Logger
 * 
 * Enhanced logging utility for production environments with file rotation,
 * error tracking, and structured log formats
 */

const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// Log directory setup
const logDir = path.join(__dirname, '../../logs');
const fs = require('fs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ level, message, timestamp, ...meta }) => `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`
  )
);

// Create file transports with rotation
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'errors-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat
});

// Configure logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'raffle-website' },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(fileTransport);
  logger.add(errorFileTransport);
  
  logger.info('Production logging initialized with file rotation');
} else {
  logger.info('Development logging initialized (console only)');
}

/**
 * Log user activity for auditing purposes
 * 
 * @param {string} userId - User identifier or IP address
 * @param {string} action - Action performed
 * @param {Object} details - Additional details about the action
 */
logger.activity = (userId, action, details = {}) => {
  logger.info(`User action: ${action}`, {
    userId,
    action,
    ...details,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log transaction details
 * 
 * @param {string} transactionId - Transaction identifier
 * @param {string} status - Transaction status
 * @param {Object} details - Transaction details
 */
logger.transaction = (transactionId, status, details = {}) => {
  logger.info(`Transaction ${transactionId}: ${status}`, {
    transactionId,
    status,
    ...details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;
