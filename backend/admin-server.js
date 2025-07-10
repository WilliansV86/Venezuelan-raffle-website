// Admin server for payment confirmation
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure CORS - Allow from all origins for development
app.use(cors());

// Add headers to allow any origin (backup for older browsers)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
  next();
});

// Admin auth middleware
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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Transaction schema
const transactionSchema = new mongoose.Schema({
  participant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Participant' 
  },
  raffle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Raffle' 
  },
  tickets: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket' 
  }],
  paymentAmount: Number,
  paymentMethod: String,
  paymentReference: String,
  paymentProof: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending'
  },
  adminNotes: String,
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  emailScheduledFor: Date
}, { timestamps: true });

// Define models if they don't exist
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
const Participant = mongoose.models.Participant || mongoose.model('Participant', {});
const Raffle = mongoose.models.Raffle || mongoose.model('Raffle', {});
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', {});

// Email sending function
async function sendEmail(options) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: options.to,
    from: process.env.EMAIL_FROM || 'noreply@venezuelanraffle.com',
    subject: options.subject,
    html: options.html,
    attachments: options.attachments || []
  };
  
  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response) {
      console.error('Error body:', error.response.body);
    }
    throw error;
  }
}

// Process emails function
async function processPendingEmails() {
  try {
    const pendingTransactions = await Transaction.find({
      status: 'confirmed',
      emailSent: false
    }).populate('participant raffle tickets');

    console.log(`Found ${pendingTransactions.length} pending emails to process`);
    
    let success = 0;
    let failed = 0;
    
    for (const transaction of pendingTransactions) {
      try {
        const ticketNumbers = transaction.tickets.map(ticket => ticket.number);
        
        // Create email HTML
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Confirmación de Compra - Tu Suerte Está Aquí</title>
          </head>
          <body>
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background-color: #1e5799; color: white; padding: 20px; text-align: center;">
                <h1>Tu Suerte Está Aquí</h1>
              </div>
              <div style="padding: 20px;">
                <h2>¡Gracias por tu compra!</h2>
                <p>Hola ${transaction.participant.name},</p>
                <p>Tu pago ha sido confirmado. A continuación encontrarás los números de tickets asignados:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b6b;">
                  <h3>Números asignados:</h3>
                  <div style="font-size: 24px; font-weight: bold; color: #e74c3c; text-align: center;">
                    ${ticketNumbers.join(' · ')}
                  </div>
                </div>
                
                <p>¡Te deseamos mucha suerte en el sorteo!</p>
              </div>
              <div style="background-color: #f2f2f2; padding: 20px; text-align: center; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Tu Suerte Está Aquí. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        // Send the email
        await sendEmail({
          to: transaction.participant.email,
          subject: `Confirmación de compra - ${transaction.raffle.title}`,
          html: emailHtml
        });
        
        // Update the transaction
        transaction.emailSent = true;
        transaction.emailSentAt = new Date();
        await transaction.save();
        
        success++;
        console.log(`Email sent successfully for transaction ${transaction._id}`);
      } catch (error) {
        failed++;
        console.error(`Failed to send email for transaction ${transaction._id}:`, error);
      }
    }
    
    return { success, failed, total: pendingTransactions.length };
  } catch (error) {
    console.error('Error processing pending emails:', error);
    return { success: 0, failed: 0, error: error.message };
  }
}

// ADMIN ROUTES

// Get all transactions
app.get('/api/admin/transactions', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const transactions = await Transaction.find(filter)
      .populate('participant', 'name email phone')
      .populate('raffle', 'title ticketPrice')
      .populate('tickets', 'number')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get transaction details
app.get('/api/admin/transactions/:id', adminAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('participant', 'name email phone')
      .populate('raffle', 'title ticketPrice')
      .populate('tickets', 'number');
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update transaction status
app.put('/api/admin/transactions/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    
    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    // Update the transaction
    transaction.status = status;
    if (adminNotes) {
      transaction.adminNotes = adminNotes;
    }
    
    // If status is confirmed, schedule email immediately
    if (status === 'confirmed') {
      transaction.emailScheduledFor = new Date();
    }
    
    await transaction.save();
    
    // If status is confirmed, try to send email immediately
    let emailResult = null;
    if (status === 'confirmed' && !transaction.emailSent) {
      try {
        await processPendingEmails();
        emailResult = { sent: true, message: 'Email scheduled for sending' };
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        emailResult = { sent: false, error: emailError.message };
      }
    }
    
    res.json({ 
      success: true, 
      message: `Transaction status updated to ${status}`,
      data: { transaction, emailResult }
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process pending emails manually
app.post('/api/admin/process-emails', adminAuth, async (req, res) => {
  try {
    const result = await processPendingEmails();
    
    res.json({
      success: true,
      message: 'Email processing completed',
      data: result
    });
  } catch (error) {
    console.error('Error processing emails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check endpoint
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
const PORT = process.env.ADMIN_PORT || 5200;
app.listen(PORT, () => {
  console.log(`Admin server running on port ${PORT}`);
  console.log(`Admin key: ${process.env.ADMIN_KEY}`);
});
