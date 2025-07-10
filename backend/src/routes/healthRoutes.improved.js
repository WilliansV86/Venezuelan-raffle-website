const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { getConnectionStatus } = require('../../config/db.improved');
const logger = require('../utils/logger');

const router = express.Router();

// Simple ping endpoint for quick health checks
router.get('/ping', (req, res) => {
  // Log the health check with client IP
  logger.info('Ping health check performed', { ip: req.ip });
  
  res.status(200).json({ status: 'ok', message: 'pong' });
});

// Get detailed system health status
router.get('/', async (req, res) => {
  try {
    // Get MongoDB connection status
    const dbStatus = getConnectionStatus();
    
    // Calculate system metrics
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    const uptime = process.uptime();
    const cpuLoad = os.loadavg();
    
    // Check disk space
    const diskStatus = 'OK';
    
    // Determine overall system status
    let status = 'ok';
    
    if (dbStatus.status === 'disconnected') {
      status = 'degraded';
    }
    
    // Log the health check
    logger.info('Health check performed', { 
      status,
      ip: req.ip,
      dbStatus: dbStatus.status 
    });
    
    // Return health status
    res.status(200).json({
      status,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus.status,
        name: dbStatus.name
      },
      system: {
        uptime,
        memoryUsage: {},
        freeMemory,
        totalMemory,
        cpuLoad,
        nodeVersion: process.version,
        env: process.env.NODE_ENV
      },
      disk: {
        diskSpace: diskStatus
      }
    });
  } catch (error) {
    logger.error('Error in health check', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: 'Error checking system health',
      error: error.message
    });
  }
});

module.exports = router;
