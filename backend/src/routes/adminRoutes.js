const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction', {}, 'transactions');
const { sendConfirmationEmail } = require('../utils/emailService');

// Auth middleware for admin routes
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Admin access required' 
    });
  }
  
  next();
};

// Apply admin auth middleware to all routes in this router
router.use(adminAuth);

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions (optionally filtered by status)
 * @access  Admin
 */
router.get('/transactions', async (req, res) => {
  try {
    const { status } = req.query;
    
    // Filter by status if provided
    const filter = status ? { status } : {};
    
    const transactions = await Transaction.find(filter)
      .populate('participant', 'name email phone identificationNumber')
      .populate('raffle', 'title ticketPrice')
      .populate('tickets', 'number')
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/transactions/:id
 * @desc    Get transaction by ID
 * @access  Admin
 */
router.get('/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('participant', 'name email phone identificationNumber')
      .populate('raffle', 'title ticketPrice')
      .populate('tickets', 'number');
      
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/admin/transactions/:id/status
 * @desc    Update transaction status (confirm or reject payment)
 * @access  Admin
 */
router.put('/transactions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    // Validate status
    if (!status || !['pending', 'confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, confirmed, or rejected'
      });
    }
    
    // Find the transaction
    const transaction = await Transaction.findById(id)
      .populate('participant')
      .populate('raffle')
      .populate('tickets');
      
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    const previousStatus = transaction.status;
    
    // Update transaction
    transaction.status = status;
    
    // If confirming payment, schedule confirmation email immediately
    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      transaction.emailScheduledFor = new Date(); // Schedule for immediate sending
      transaction.emailSent = false; // Reset email sent flag
    }
    
    // Add admin notes if provided
    if (adminNotes) {
      transaction.adminNotes = adminNotes;
    }
    
    // Save transaction
    await transaction.save();
    
    // If confirming payment, attempt to send email immediately
    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      try {
        const ticketNumbers = transaction.tickets.map(ticket => ticket.number);
        
        // Send confirmation email asynchronously
        sendConfirmationEmail(
          transaction,
          transaction.participant,
          transaction.raffle,
          ticketNumbers
        ).then(emailResult => {
          if (emailResult.success) {
            transaction.emailSent = true;
            transaction.emailSentAt = new Date();
            transaction.save().catch(err => console.error('Error updating email status:', err));
            
            console.log(`Confirmation email sent successfully for transaction ${transaction._id}`);
          } else {
            console.error(`Failed to send confirmation email for transaction ${transaction._id}:`, emailResult.error);
          }
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // We don't fail the request if email fails, it will be retried by the scheduler
      }
    }
    
    res.json({
      success: true,
      message: `Transaction status updated to ${status}`,
      data: transaction
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
