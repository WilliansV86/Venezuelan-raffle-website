// Minimal server to test basic functionality
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Create express app
const app = express();
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Minimal server is running!');
});

// Start server
const PORT = 5100;
app.listen(PORT, () => {
  console.log(`Minimal server listening on port ${PORT}`);
});
