/**
 * Admin server integration module for Venezuelan Raffle Website
 */
const express = require('express');
const adminRoutes = require('./routes/adminRoutes');
const { initEmailScheduler } = require('./utils/emailScheduler');

/**
 * Initialize and configure the admin server components
 * @param {Object} app - Express application instance
 */
const initAdminServer = (app) => {
  // Register admin routes
  app.use('/api/admin', adminRoutes);

  // Initialize email scheduler to run every 10 minutes
  // This will process any pending emails for confirmed transactions
  const scheduleIntervalMinutes = process.env.EMAIL_SCHEDULE_INTERVAL_MINUTES || 10;
  initEmailScheduler(parseInt(scheduleIntervalMinutes, 10));

  console.log('✅ Admin server components initialized');
  console.log(`✅ Email scheduler configured to run every ${scheduleIntervalMinutes} minutes`);
};

module.exports = { initAdminServer };
