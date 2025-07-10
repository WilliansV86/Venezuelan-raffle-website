/**
 * Admin Monitoring Routes
 * 
 * Protected endpoints for monitoring system health and performance
 */

const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const Raffle = require('../models/Raffle');
const Transaction = require('../models/Transaction');
const Participant = require('../models/Participant');
const Ticket = require('../models/Ticket');
const { protectAdmin } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/admin/monitor/system
 * @desc    Get detailed system metrics
 * @access  Admin
 */
router.get('/system', protectAdmin, async (req, res) => {
  try {
    // System information
    const systemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
      nodeVersion: process.version
    };

    // Calculate memory usage percentage
    systemInfo.memoryUsagePercent = {
      rss: ((systemInfo.memoryUsage.rss / systemInfo.totalMemory) * 100).toFixed(2),
      heapTotal: ((systemInfo.memoryUsage.heapTotal / systemInfo.totalMemory) * 100).toFixed(2),
      heapUsed: ((systemInfo.memoryUsage.heapUsed / systemInfo.totalMemory) * 100).toFixed(2),
      external: ((systemInfo.memoryUsage.external / systemInfo.totalMemory) * 100).toFixed(2),
      systemUsed: (((systemInfo.totalMemory - systemInfo.freeMemory) / systemInfo.totalMemory) * 100).toFixed(2)
    };

    res.json({
      success: true,
      systemInfo
    });
  } catch (error) {
    logger.error('Error getting system metrics', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to get system metrics' });
  }
});

/**
 * @route   GET /api/admin/monitor/database
 * @desc    Get database metrics and statistics
 * @access  Admin
 */
router.get('/database', protectAdmin, async (req, res) => {
  try {
    // Database connection status
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Collection counts
    const [raffleCount, participantCount, ticketCount, transactionCount] = await Promise.all([
      Raffle.countDocuments(),
      Participant.countDocuments(),
      Ticket.countDocuments(),
      Transaction.countDocuments()
    ]);
    
    // Assigned vs available tickets
    const assignedTickets = await Ticket.countDocuments({ isAssigned: true });
    const totalTickets = await Ticket.countDocuments();
    const availableTickets = totalTickets - assignedTickets;
    
    // Recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('participant', 'name email phone')
      .populate('raffle', 'name');

    res.json({
      success: true,
      database: {
        status: dbStatus,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        collections: {
          raffles: raffleCount,
          participants: participantCount,
          tickets: totalTickets,
          transactions: transactionCount
        },
        tickets: {
          total: totalTickets,
          assigned: assignedTickets,
          available: availableTickets,
          percentageAssigned: totalTickets > 0 ? ((assignedTickets / totalTickets) * 100).toFixed(2) : 0
        },
        recentTransactions: recentTransactions.map(t => ({
          id: t._id,
          date: t.createdAt,
          participant: t.participant ? `${t.participant.name} (${t.participant.email})` : 'Unknown',
          raffle: t.raffle ? t.raffle.name : 'Unknown',
          amount: t.amount,
          ticketCount: t.ticketCount
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting database metrics', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to get database metrics' });
  }
});

/**
 * @route   GET /api/admin/monitor/logs
 * @desc    Get recent application logs
 * @access  Admin
 */
router.get('/logs', protectAdmin, async (req, res) => {
  try {
    const logsDir = path.join(__dirname, '../../../logs');
    
    if (!fs.existsSync(logsDir)) {
      return res.json({ success: true, logs: [], message: 'No log files found' });
    }
    
    // Get most recent log files
    const logFiles = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .sort()
      .reverse()
      .slice(0, 2);
    
    if (logFiles.length === 0) {
      return res.json({ success: true, logs: [], message: 'No log files found' });
    }
    
    // Read most recent log file
    const logFilePath = path.join(logsDir, logFiles[0]);
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    
    // Parse and get last 50 log entries
    const logEntries = logContent
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { level: 'unknown', message: line, timestamp: new Date().toISOString() };
        }
      })
      .slice(-50);
    
    res.json({
      success: true,
      logs: {
        filename: logFiles[0],
        entries: logEntries
      }
    });
  } catch (error) {
    logger.error('Error getting log files', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to get log files' });
  }
});

/**
 * @route   POST /api/admin/monitor/test-email
 * @desc    Send a test email to verify email configuration
 * @access  Admin
 */
router.post('/test-email', protectAdmin, async (req, res) => {
  try {
    const { emailAddress } = req.body;
    
    if (!emailAddress) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }
    
    const nodemailer = require('nodemailer');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Send test email
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: emailAddress,
      subject: "Test Email from Venezuelan Raffle Website",
      text: "This is a test email sent from the admin monitoring panel.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #0066cc;">Email Test Successful!</h2>
          <p>This is a test email sent from the Venezuelan Raffle Website admin monitoring panel.</p>
          <p>If you're seeing this email, your email configuration is working properly.</p>
          <hr style="border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `
    });
    
    logger.info('Admin test email sent', { to: emailAddress });
    res.json({ success: true, message: `Test email sent to ${emailAddress}` });
  } catch (error) {
    logger.error('Failed to send test email', { error: error.message });
    res.status(500).json({ success: false, error: `Failed to send test email: ${error.message}` });
  }
});

module.exports = router;
