const asyncHandler = require('express-async-handler');

// This is a placeholder controller to prevent server crashes.
// The participant logic has been integrated into other parts of the application.
const getParticipantById = asyncHandler(async (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found or is deprecated.' });
});

module.exports = {
  getParticipantById,
};
