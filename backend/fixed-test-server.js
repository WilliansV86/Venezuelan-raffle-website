// Complete test server with ticket purchase and email functionality - Fixed for FormData handling
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const https = require('https');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Import admin server components
const { initAdminServer } = require('./src/adminServer');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)){
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Define file filter function for multer
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple function to generate a unique ID without uuid dependency
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URI set:', process.env.MONGO_URI ? 'Yes' : 'No');
console.log('EMAIL_PROVIDER:', process.env.EMAIL_PROVIDER);
console.log('SENDGRID_API_KEY set:', process.env.SENDGRID_API_KEY ? 'Yes' : 'No');

// Define schemas and models here to avoid model registration issues
const raffleSchema = new mongoose.Schema({}, { strict: false });
const Raffle = mongoose.model('Raffle', raffleSchema, 'raffles');

const ticketSchema = new mongoose.Schema({}, { strict: false });
const Ticket = mongoose.model('Ticket', ticketSchema, 'tickets');

const participantSchema = new mongoose.Schema({}, { strict: false });
const Participant = mongoose.model('Participant', participantSchema, 'participants');

const transactionSchema = new mongoose.Schema({}, { strict: false });
const Transaction = mongoose.model('Transaction', transactionSchema, 'transactions');

// SendGrid email function - Enhanced implementation with anti-spam measures and file attachment support
const sendGridMail = async (data) => {
  return new Promise((resolve, reject) => {
    // Check if SendGrid API key is available
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key is not available');
      return reject(new Error('SendGrid API key is not available'));
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'tusuerteestaaquive@gmail.com';
    
    console.log(`Sending email from: ${fromEmail} to: ${data.to}`);
    
    // Generate a unique message ID to help avoid spam filters
    const messageId = `${Date.now()}.${Math.random().toString(36).substring(2, 15)}@tusuerteestaaqui.com`;
    
    // Create the email payload
    const emailPayload = {
      personalizations: [
        {
          to: [{ email: data.to }],
          subject: data.subject,
        },
      ],
      from: { 
        email: fromEmail,
        name: 'Tu Suerte Está Aquí - Sorteos de Venezuela'
      },
      reply_to: {
        email: fromEmail,
        name: 'Servicio al Cliente - Tu Suerte Está Aquí'
      },
      subject: data.subject,
      content: [
        {
          type: 'text/html',
          value: data.html,
        },
      ],
      // Anti-spam headers
      headers: {
        'X-Message-ID': messageId,
        'List-Unsubscribe': '<mailto:unsubscribe@tusuerteestaaquive.com>, <https://www.tusuerteestaaquive.com/unsubscribe>',
        'Precedence': 'bulk'
      },
      // Mail settings to improve deliverability
      mail_settings: {
        bypass_list_management: {
          enable: false
        },
        footer: {
          enable: true,
          text: 'Tu Suerte Está Aquí - Caracas, Venezuela',
          html: '<p>Tu Suerte Está Aquí - Caracas, Venezuela</p>'
        }
      },
      tracking_settings: {
        click_tracking: {
          enable: true,
          enable_text: true
        },
        open_tracking: {
          enable: true
        },
        subscription_tracking: {
          enable: true
        }
      }
    };
    
    // Add attachments if they exist
    if (data.attachments && data.attachments.length > 0) {
      console.log(`Adding ${data.attachments.length} attachments to email`);
      
      // Process each attachment
      emailPayload.attachments = data.attachments.map(attachment => {
        console.log(`Processing attachment: ${attachment.filename}`);
        
        // For file path attachments, read and convert to base64
        if (attachment.path && fs.existsSync(attachment.path)) {
          console.log(`Reading file from path: ${attachment.path}`);
          const fileContent = fs.readFileSync(attachment.path);
          const base64Content = fileContent.toString('base64');
          
          return {
            content: base64Content,
            filename: attachment.filename,
            type: attachment.contentType || 'application/octet-stream',
            disposition: attachment.contentDisposition || 'attachment',
            content_id: attachment.cid ? `<${attachment.cid}>` : undefined
          };
        }
        // If attachment already has content in base64
        else if (attachment.content) {
          return {
            content: attachment.content,
            filename: attachment.filename,
            type: attachment.contentType || 'application/octet-stream',
            disposition: attachment.contentDisposition || 'attachment',
            content_id: attachment.cid ? `<${attachment.cid}>` : undefined
          };
        }
        else {
          console.warn(`Skipping attachment ${attachment.filename} - no valid content found`);
          return null;
        }
      }).filter(Boolean); // Remove any null entries
      
      console.log(`Processed ${emailPayload.attachments.length} valid attachments`);
    }
    
    // Convert payload to JSON
    const requestData = JSON.stringify(emailPayload);
    
    // Debug the payload if needed (excluding large base64 content)
    const debugPayload = {...emailPayload};
    if (debugPayload.attachments) {
      debugPayload.attachments = debugPayload.attachments.map(att => ({
        ...att,
        content: att.content ? '(base64 content)' : null
      }));
    }
    console.log('Email payload:', JSON.stringify(debugPayload, null, 2));

    // Set up the request options
    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestData),
        'User-Agent': 'TuSuerteApp/1.0.0'
      },
    };

    // Create the request
    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Email sent successfully via SendGrid (${res.statusCode})`);
          resolve({ success: true, status: res.statusCode });
        } else {
          console.error(`SendGrid API error: ${res.statusCode} - ${responseBody}`);
          reject(new Error(`SendGrid API error: ${res.statusCode} - ${responseBody}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`SendGrid request error: ${error.message}`);
      reject(error);
    });

    // Send the request
    req.write(requestData);
    req.end();
  });
};

// Email sending utility
const sendEmail = async (options) => {
  try {
    // Remove the attachments from console log to prevent flooding
    const optionsForLog = {...options};
    if (optionsForLog.attachments) {
      optionsForLog.attachments = optionsForLog.attachments.map(att => ({
        ...att,
        path: att.path || '(path not available)',
        content: att.content ? '(content available)' : '(no content)'
      }));
    }
    console.log('Sending email with options:', JSON.stringify(optionsForLog, null, 2));
    
    // Use SendGrid directly
    const result = await sendGridMail({
      to: options.to,
      from: options.from || process.env.EMAIL_FROM || 'noreply@venezuelanraffle.com',
      subject: options.subject,
      html: options.html,
      attachments: options.attachments // Pass the attachments to sendGridMail
    });
    
    console.log('Email sent result:', result);
    return { success: true, message: 'Email sent successfully via SendGrid' };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
};

// Define Transaction Schema if it doesn't already exist
if (!mongoose.models.Transaction) {
  const transactionSchema = new mongoose.Schema(
    {
      participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant',
        required: true
      },
      raffle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Raffle',
        required: true
      },
      paymentAmount: {
        type: Number,
        required: [true, 'El monto del pago es requerido']
      },
      paymentMethod: {
        type: String,
        required: [true, 'El método de pago es requerido'],
        enum: ['pago-movil', 'zelle', 'binance'],
      },
      paymentReference: {
        type: String,
        required: [true, 'La referencia de pago es requerida']
      },
      paymentProof: {
        type: String,  // URL to uploaded payment proof image
        required: [true, 'El comprobante de pago es requerido']
      },
      ticketCount: {
        type: Number,
        required: true
      },
      ticketPrice: {
        type: Number,
        required: true
      },
      tickets: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ticket'
        }
      ],
      status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending'
      },
      emailScheduledFor: {
        type: Date,
        default: function() {
          // Schedule email for 24 hours after transaction
          const date = new Date();
          date.setHours(date.getHours() + 24);
          return date;
        }
      },
      emailSent: {
        type: Boolean,
        default: false
      },
      emailSentAt: {
        type: Date
      },
      adminNotes: {
        type: String
      }
    },
    {
      timestamps: true
    }
  );
  
  // Register the Transaction model
  mongoose.model('Transaction', transactionSchema, 'transactions');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, options)
  .then(() => {
    console.log('✅ MongoDB Connected successfully!');
    
    // Serve uploaded files
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    
    // Enable CORS for all routes
    app.use(cors({
      origin: '*', // Allow all origins for testing
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
    }));
    
    // Initialize admin server components
    initAdminServer(app);
    
    // Add a route to manually trigger email processing (for testing)
    app.post('/api/admin/process-emails', async (req, res) => {
      try {
        const adminKey = req.headers['x-admin-key'];
        if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized - Admin access required'
          });
        }
        
        const { runSchedulerOnce } = require('./src/utils/emailScheduler');
        const result = await runSchedulerOnce();
        
        return res.json({
          success: true,
          message: 'Email processing triggered successfully',
          result
        });
      } catch (error) {
        console.error('Error triggering email processing:', error);
        return res.status(500).json({
          success: false,
          message: error.message
        });
      }
    });
    
    // Set up routes AFTER successful connection
    
    // Test route to verify server is running
    app.get('/', (req, res) => {
      res.json({ message: 'API is running' });
    });
    
    // Get active raffles route
    app.get('/api/raffles/active', async (req, res) => {
      try {
        console.log('GET /api/raffles/active - Looking for active raffles');
        
        const raffles = await Raffle.find({ 
          status: 'active',
          isActive: true,
          endDate: { $gte: new Date() }
        }).sort({ endDate: 1 });
        
        console.log(`Found ${raffles.length} active raffles`);
        
        res.json({
          success: true,
          count: raffles.length,
          data: raffles
        });
      } catch (error) {
        console.error('Error in /api/raffles/active:', error);
        res.status(500).json({ 
          success: false, 
          message: error.message,
          stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
      }
    });
    
    // Get all raffles route
    app.get('/api/raffles', async (req, res) => {
      try {
        console.log('GET /api/raffles - Looking for all raffles');
        const raffles = await Raffle.find().sort({ createdAt: -1 });
        
        console.log(`Found ${raffles.length} raffles total`);
        
        res.json({
          success: true,
          count: raffles.length,
          data: raffles
        });
      } catch (error) {
        console.error('Error in /api/raffles:', error);
        res.status(500).json({ 
          success: false, 
          message: error.message,
          stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
      }
    });
    
    // Get single raffle by ID
    app.get('/api/raffles/:id', async (req, res) => {
      try {
        const raffle = await Raffle.findById(req.params.id);
        if (!raffle) {
          return res.status(404).json({ success: false, message: 'Raffle not found' });
        }
        res.json({ success: true, data: raffle });
      } catch (error) {
        console.error('Error in GET /api/raffles/:id', error);
        res.status(500).json({ success: false, message: error.message });
      }
    });
    
    // Purchase tickets route with multer middleware for file handling
    app.post('/api/tickets/purchase', upload.single('paymentProof'), async (req, res) => {
      try {
        console.log('POST /api/tickets/purchase - Processing ticket purchase');
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        // Extract data from form fields
        const raffleId = req.body.raffleId;
        const quantity = parseInt(req.body.quantity, 10);
        const paymentMethod = req.body.paymentMethod;
        const paymentReference = req.body.paymentReference;
        
        // Construct participant data from form fields
        const participantData = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          name: `${req.body.firstName} ${req.body.lastName}`,
          email: req.body.email,
          phone: req.body.whatsappNumber || '',
          identificationNumber: req.body.identificationNumber
        };
        
        // Validate required fields
        if (!raffleId || !participantData.email || !quantity || !paymentMethod) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields for ticket purchase' 
          });
        }
        
        // Check if we have a payment proof file
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            message: 'Payment proof file is required' 
          });
        }
        
        // 1. Get the raffle
        const raffle = await Raffle.findById(raffleId);
        if (!raffle) {
          return res.status(404).json({ success: false, message: 'Raffle not found' });
        }
        
        // 2. Create or get participant
        let participant;
        const existingParticipant = await Participant.findOne({ email: participantData.email });
        
        if (existingParticipant) {
          participant = existingParticipant;
          // Update participant data if needed
          Object.assign(participant, participantData);
          await participant.save();
        } else {
          participant = await Participant.create(participantData);
        }
        
        // 3. Create transaction with payment proof file path
        const transaction = await Transaction.create({
          participantId: participant._id,
          raffleId: raffle._id,
          quantity,
          paymentMethod,
          paymentReference: paymentReference || 'N/A',
          amount: raffle.ticketPrice * quantity,
          status: 'completed',
          paymentProofPath: req.file ? req.file.path : null,
          createdAt: new Date()
        });
        
        // 4. Generate tickets
        const ticketNumbers = [];
        const tickets = [];
        
        try {
          // Generate random ticket numbers instead of sequential
          // This avoids duplicate key errors by using a wide range
          for (let i = 0; i < quantity; i++) {
            // Generate a random 4-digit number between 1000-9999
            let ticketNumber;
            let attempts = 0;
            const maxAttempts = 10;
            
            // Keep trying until we find an unused number or reach max attempts
            while (attempts < maxAttempts) {
              ticketNumber = 1000 + Math.floor(Math.random() * 9000);
              
              // Check if this number already exists
              const existingTicket = await Ticket.findOne({ 
                number: ticketNumber, 
                raffleId: raffle._id 
              });
              
              if (!existingTicket) {
                break; // Found an unused number
              }
              
              attempts++;
            }
            
            console.log(`Generated ticket number: ${ticketNumber}`);
            ticketNumbers.push(ticketNumber);
            
            // Save ticket one by one to handle potential errors gracefully
            try {
              const ticket = await Ticket.create({
                number: ticketNumber,
                raffleId: raffle._id,
                participantId: participant._id,
                transactionId: transaction._id,
                createdAt: new Date(),
                // Add additional fields to match potential schema requirements
                raffle: raffle._id, // Alternative field name
                ticketNumber: ticketNumber, // Alternative field name
                participant: participant._id, // Alternative field name
                transaction: transaction._id // Alternative field name
              });
              
              tickets.push(ticket);
              console.log(`Successfully created ticket ${ticketNumber}`);
            } catch (ticketError) {
              console.error(`Failed to create ticket ${ticketNumber}:`, ticketError.message);
              // Continue with the next ticket instead of failing the whole batch
            }
          }
        } catch (ticketGenError) {
          console.error('Error generating tickets:', ticketGenError);
          // If we've generated any tickets successfully, continue the process
          // Otherwise, fail the request
          if (ticketNumbers.length === 0) {
            throw ticketGenError;
          }
        }
    
    // 5. Create a Transaction record (instead of sending email immediately)
    try {
      // Create transaction record
      const Transaction = mongoose.model('Transaction');
      const transaction = new Transaction({
        participant: participant._id,
        raffle: raffle._id,
        paymentAmount: quantity * raffle.ticketPrice,
        paymentMethod: req.body.paymentMethod,
        paymentReference: req.body.paymentReference,
        paymentProof: req.file ? req.file.path : null,
        ticketCount: quantity,
        ticketPrice: raffle.ticketPrice,
        tickets: tickets.map(ticket => ticket._id),
        status: 'pending',
        emailScheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        emailSent: false
      });
      
      // Save the transaction
      await transaction.save();
      
      console.log(`Transaction created: ${transaction._id}. Emails will be sent after admin approval.`);
      
    } catch (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Continue despite transaction record creation failure
    }
    
    // Return success response with ticket numbers
    res.json({
      success: true,
      message: 'Tickets purchased successfully',
      data: {
        ticketNumbers: ticketNumbers
      }
    });
  } catch (error) {
    console.error('Error in POST /api/tickets/purchase:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});
          try {
            const adminEmailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Nueva Compra de Tickets - Administración</title>
              <style>
                body {
                  font-family: 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                }
                .container {
                  border: 1px solid #e0e0e0;
                  border-radius: 4px;
                  overflow: hidden;
                  margin: 20px auto;
                }
                .header {
                  padding: 30px 40px;
                  text-align: center;
                  border-bottom: 1px solid #e0e0e0;
                  background-color: #2c3e50;
                  color: #ffffff;
                }
                .header h1 {
                  margin: 0;
                  font-weight: 300;
                  letter-spacing: 0.5px;
                }
                .header p {
                  margin: 5px 0 0;
                  opacity: 0.8;
                }
                .content {
                  padding: 30px 40px;
                  background-color: #ffffff;
                }
                .section {
                  margin-bottom: 30px;
                }
                .section-title {
                  font-size: 16px;
                  text-transform: uppercase;
                  color: #7f8c8d;
                  letter-spacing: 1px;
                  margin-bottom: 15px;
                  border-bottom: 1px solid #eee;
                  padding-bottom: 5px;
                }
                .ticket-block {
                  background-color: #f5f5f5;
                  padding: 15px;
                  border-radius: 4px;
                  margin: 15px 0;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  text-align: left;
                  padding: 10px 5px;
                }
                th {
                  font-weight: 500;
                  color: #555;
                  width: 140px;
                }
                .footer {
                  padding: 15px;
                  text-align: center;
                  font-size: 12px;
                  color: #999;
                  background-color: #fafafa;
                  border-top: 1px solid #e0e0e0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Nueva Compra de Tickets</h1>
                  <p>${new Date().toLocaleString('es-VE')}</p>
                </div>
                <div class="content">
                  <div class="section">
                    <h3 class="section-title">Información del Participante</h3>
                    <table>
                      <tr>
                        <th>Nombre</th>
                        <td>${participant.name}</td>
                      </tr>
                      <tr>
                        <th>Email</th>
                        <td>${participant.email}</td>
                      </tr>
                      <tr>
                        <th>Teléfono</th>
                        <td>${participant.phone}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div class="section">
                    <h3 class="section-title">Información del Sorteo</h3>
                    <div class="ticket-block">
                      <table>
                        <tr>
                          <th>Sorteo</th>
                          <td>${raffle.title}</td>
                        </tr>
                        <tr>
                          <th>Tickets</th>
                          <td>${quantity}</td>
                        </tr>
                        <tr>
                          <th>Números</th>
                          <td><strong>${ticketNumbers.join(', ')}</strong></td>
                        </tr>
                      </table>
                    </div>
                  </div>
                  
                  <div class="section">
                    <h3 class="section-title">Información del Pago</h3>
                    <table>
                      <tr>
                        <th>Método</th>
                        <td>${paymentMethod}</td>
                      </tr>
                      <tr>
                        <th>Referencia</th>
                        <td>${paymentReference || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Fecha</th>
                        <td>${new Date().toLocaleString('es-VE', {dateStyle: 'medium', timeStyle: 'short'})}</td>
                      </tr>
                    </table>
                    
                    <div style="margin-top: 20px;">
                      <h4 style="margin-bottom: 10px; color: #7f8c8d; font-size: 14px;">COMPROBANTE DE PAGO</h4>
                      <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">
                        ${req.file ? 
                          `<img src="cid:payment-proof" alt="Comprobante de pago" style="max-width: 100%; height: auto; border-radius: 3px;">` : 
                          '<p style="color: #e74c3c;">No se adjuntó comprobante de pago</p>'
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div class="footer">
                  <p>Este es un email de notificación para administradores. ${new Date().toISOString()}</p>
                </div>
              </div>
            </body>
            </html>
            `;
            
            // Create email options with attachment if payment proof exists
            const adminEmailOptions = {
              to: process.env.ADMIN_EMAIL,
              subject: `[ADMIN] Nueva compra - ${raffle.title}`,
              html: adminEmailHtml
            };
            
            // Add payment proof as attachment if available
            if (req.file && req.file.path) {
              adminEmailOptions.attachments = [
                {
                  filename: req.file.originalname || 'comprobante.jpg',
                  path: req.file.path,
                  contentType: req.file.mimetype,
                  contentDisposition: 'inline',
            tickets: tickets.map(t => t.number),
            transaction: transaction._id,
            participant: participant._id
          }
        });
        
      } catch (error) {
        console.error('Error processing ticket purchase:', error);
        res.status(500).json({ 
          success: false, 
          message: error.message,
          stack: process.env.NODE_ENV === 'production' ? null : error.stack
        });
      }
    });
    
    // Helper function to get next ticket number
    async function getNextTicketNumber(raffle) {
      // Get the highest ticket number in the entire collection to avoid duplicates
      // This ensures uniqueness across all raffles
      const lastTicket = await Ticket.findOne({}).sort({ number: -1 });
      const startNumber = 1;
      
      if (!lastTicket) {
        return startNumber;
      }
      
      // Generate a safe number higher than any existing number
      return lastTicket.number + 1;
    }
    
    // Start server
    const PORT = 5100; // Using a different port to avoid conflicts
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      console.log('Try accessing:');
      console.log(`- http://localhost:${PORT}/api/raffles/active`);
      console.log(`- http://localhost:${PORT}/api/raffles`);
      console.log(`- http://localhost:${PORT}/api/tickets/purchase (POST with FormData)`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('ENOTFOUND')) {
      console.error('Could not find the MongoDB server. Check your URI.');
    } else if (err.message.includes('Authentication failed')) {
      console.error('MongoDB authentication failed. Check your username and password.');
    } else if (err.message.includes('ETIMEDOUT')) {
      console.error('Connection timed out. Your IP may not be whitelisted in MongoDB Atlas.');
    }
    process.exit(1);
  });
