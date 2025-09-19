// Simple wrapper script to ensure server starts with the correct port
require('dotenv').config();

// Force the port to 5100 for consistency
process.env.PORT = 5100;

// Load the main server file
require('./server.cjs');
