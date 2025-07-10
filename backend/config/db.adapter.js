/**
 * This adapter file helps connect the improved MongoDB connection code
 * with the existing server.js that expects a direct function
 */

// Import the improved connection module
const { connectDB: improvedConnectDB } = require('./db');

// Export as a direct function to match what server.js expects
module.exports = function connectDatabaseAdapter() {
  return improvedConnectDB();
};
