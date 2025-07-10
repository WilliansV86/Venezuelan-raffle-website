/**
 * Email Scheduler
 * Processes pending confirmation emails on a scheduled basis
 */

const mongoose = require('mongoose');
const { processPendingEmails } = require('./emailService');
const logger = require('./logger');

/**
 * Initialize the email scheduler
 * @param {number} intervalMinutes - How often to check for pending emails (in minutes)
 */
const initEmailScheduler = (intervalMinutes = 10) => {
  // Convert minutes to milliseconds
  const interval = intervalMinutes * 60 * 1000;
  
  logger.info(`Starting email scheduler to run every ${intervalMinutes} minutes`);
  
  // Schedule the first run immediately
  setTimeout(() => {
    runScheduler();
    
    // Then set up recurring interval
    setInterval(runScheduler, interval);
  }, 5000); // Start after 5 seconds to let server initialize
};

/**
 * Run the scheduler process once
 */
const runScheduler = async () => {
  try {
    logger.info('Email scheduler: Running pending email check');
    
    // Check MongoDB connection before proceeding
    if (mongoose.connection.readyState !== 1) {
      logger.error('Email scheduler: MongoDB not connected, skipping email processing');
      return;
    }
    
    // Process pending emails
    const result = await processPendingEmails();
    
    logger.info(`Email scheduler: Processed ${result.processed} emails (${result.success} successful, ${result.failed} failed)`);
    
  } catch (error) {
    logger.error('Email scheduler: Error processing emails', { error: error.message });
    console.error('Email scheduler error:', error);
  }
};

/**
 * Run the scheduler manually (one time)
 * Useful for testing or running via cron job
 */
const runSchedulerOnce = async () => {
  try {
    console.log('Running email scheduler once...');
    await runScheduler();
    console.log('Email scheduler completed');
    return true;
  } catch (error) {
    console.error('Error running email scheduler:', error);
    return false;
  }
};

// If this module is run directly, execute runSchedulerOnce
if (require.main === module) {
  runSchedulerOnce()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal error in email scheduler:', err);
      process.exit(1);
    });
}

module.exports = {
  initEmailScheduler,
  runSchedulerOnce
};
