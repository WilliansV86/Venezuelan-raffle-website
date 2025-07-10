const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Enable ALL CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add test routes
app.use('/api/test', require('./src/routes/testRoute'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Minimal Test Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Server Error',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/api/test/ping`);
});
