const asyncHandler = require('express-async-handler');
const Raffle = require('../models/Raffle');

// @desc    Update raffle display progress settings
// @route   PUT /api/raffles/:id/display-progress
// @access  Admin
const updateRaffleProgress = asyncHandler(async (req, res) => {
  console.log('===== updateRaffleProgress called =====');
  console.log('Headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Authorization header:', req.headers.authorization);
  console.log('x-admin-key header:', req.headers['x-admin-key']);
  
  try {
    const { id } = req.params;
    console.log('Raffle ID:', id);
    const { displayProgressMode, displayProgressValue } = req.body;
    
    // Validate input
    if (displayProgressMode !== 'automatic' && displayProgressMode !== 'manual') {
      return res.status(400).json({
        success: false,
        message: 'Display progress mode must be either "automatic" or "manual"'
      });
    }
    
    if (displayProgressMode === 'manual' && (displayProgressValue < 0 || displayProgressValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Display progress value must be between 0 and 100'
      });
    }
    
    // Find and update the raffle
    const raffle = await Raffle.findById(id);
    
    if (!raffle) {
      return res.status(404).json({
        success: false,
        message: 'Raffle not found'
      });
    }
    
    // Update the fields
    raffle.displayProgressMode = displayProgressMode;
    
    // Only set displayProgressValue if mode is manual
    if (displayProgressMode === 'manual') {
      raffle.displayProgressValue = displayProgressValue;
    } else {
      raffle.displayProgressValue = null; // Reset to null for automatic mode
    }
    
    // Save the raffle
    await raffle.save();
    
    res.status(200).json({
      success: true,
      message: 'Raffle progress display updated successfully',
      data: {
        displayProgressMode: raffle.displayProgressMode,
        displayProgressValue: raffle.displayProgressValue
      }
    });
  } catch (error) {
    console.error('Error updating raffle progress display:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating raffle progress display',
      error: error.message
    });
  }
});

module.exports = {
  updateRaffleProgress
};
