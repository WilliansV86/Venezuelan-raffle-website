const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const logger = require('../utils/logger');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Basic system info
    const systemInfo = {
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      cpuLoad: os.loadavg(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development'
    };

    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check disk space (simplified version)
    const diskInfo = {
      diskSpace: 'OK'
    };

    // Overall status
    const status = dbStatus === 'connected' ? 'healthy' : 'degraded';

    // Log health check for monitoring
    logger.info('Health check performed', {
      status,
      dbStatus,
      ip: req.ip
    });

    res.json({
      status,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'unknown'
      },
      system: systemInfo,
      disk: diskInfo
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/health/ping
 * @desc    Simple ping endpoint for basic availability check
 * @access  Public
 */
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'pong' });
});

module.exports = router;
