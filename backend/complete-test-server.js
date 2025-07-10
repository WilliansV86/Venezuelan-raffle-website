// Complete test server with ticket purchase and email functionality
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const https = require('https');

// Simple function to generate a unique ID without uuid dependency
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// SendGrid email function
const sendGridMail = async (data) => {
  return new Promise((resolve, reject) => {
    // Check if SendGrid API key is available
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key is not available');
      return reject(new Error('SendGrid API key is not available'));
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    
    // Prepare the request data
    const requestData = JSON.stringify({
      personalizations: [
        {
          to: [{ email: data.to }],
          subject: data.subject,
        },
      ],
      from: { email: process.env.EMAIL_FROM || data.from || 'noreply@venezuelanraffle.com' },
      content: [
        {
          type: 'text/html',
          value: data.html,
        },
      ],
    });

    // Set up the request options
    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': requestData.length,
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
          console.log('Email sent successfully via SendGrid');
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
  console.log('Sending email with options:', JSON.stringify(options, null, 2));
  
  try {
    // Use SendGrid directly
    const result = await sendGridMail({
      to: options.to,
      from: options.from || process.env.EMAIL_FROM || 'noreply@venezuelanraffle.com',
      subject: options.subject,
      html: options.html
    });
    
    console.log('Email sent result:', result);
    return { success: true, message: 'Email sent successfully via SendGrid' };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, options)
  .then(() => {
    console.log('✅ MongoDB Connected successfully!');
    
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
    
    // Purchase tickets route
    app.post('/api/tickets/purchase', async (req, res) => {
      try {
        console.log('POST /api/tickets/purchase - Processing ticket purchase');
        console.log('Request body:', req.body);
        
        const { raffleId, participantData, quantity, paymentMethod, paymentReference } = req.body;
        
        if (!raffleId || !participantData || !quantity || !paymentMethod) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields for ticket purchase' 
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
        
        // 3. Create transaction
        const transaction = await Transaction.create({
          participantId: participant._id,
          raffleId: raffle._id,
          quantity,
          paymentMethod,
          paymentReference: paymentReference || 'N/A',
          amount: raffle.ticketPrice * quantity,
          status: 'completed',
          createdAt: new Date()
        });
        
        // 4. Generate tickets
        const ticketNumbers = [];
        const ticketDocs = [];
        
        for (let i = 0; i < quantity; i++) {
          // Generate ticket number (simple sequential for this test)
          const ticketNumber = await getNextTicketNumber(raffle);
          ticketNumbers.push(ticketNumber);
          
          // Create ticket document
          ticketDocs.push({
            number: ticketNumber,
            raffleId: raffle._id,
            participantId: participant._id,
            transactionId: transaction._id,
            createdAt: new Date()
          });
        }
        
        // Save all tickets
        const tickets = await Ticket.insertMany(ticketDocs);
        
        // 5. Send confirmation email
        const emailHtml = `
          <h1>Confirmación de Compra - Sorteo Venezolano</h1>
          <p>Gracias por tu compra, ${participant.name}!</p>
          <p>Has comprado ${quantity} ticket(s) para ${raffle.title}.</p>
          <p>Tus números de ticket son: ${ticketNumbers.join(', ')}.</p>
          <p>Método de pago: ${paymentMethod}</p>
          <p>Referencia de pago: ${paymentReference || 'N/A'}</p>
          <p>Buena suerte!</p>
        `;
        
        const emailOptions = {
          to: participant.email,
          subject: `Confirmación de compra - ${raffle.title}`,
          html: emailHtml
        };
        
        try {
          const emailResult = await sendEmail(emailOptions);
          console.log('Email sending result:', emailResult);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the transaction just because email failed
        }
        
        // Send copy to admin if configured
        if (process.env.ADMIN_EMAIL) {
          try {
            const adminEmailOptions = {
              to: process.env.ADMIN_EMAIL,
              subject: `[ADMIN] Nueva compra - ${raffle.title}`,
              html: `
                <h1>[ADMIN] Nueva compra de tickets</h1>
                <p>Participante: ${participant.name} (${participant.email})</p>
                <p>Teléfono: ${participant.phone}</p>
                <p>Raffle: ${raffle.title}</p>
                <p>Cantidad: ${quantity} tickets</p>
                <p>Números: ${ticketNumbers.join(', ')}</p>
                <p>Método de pago: ${paymentMethod}</p>
                <p>Referencia: ${paymentReference || 'N/A'}</p>
              `
            };
            await sendEmail(adminEmailOptions);
          } catch (adminEmailError) {
            console.error('Failed to send admin notification email:', adminEmailError);
          }
        }
        
        // Return success response
        res.json({
          success: true,
          message: 'Tickets purchased successfully',
          data: {
            tickets,
            transaction,
            participant
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
      const lastTicket = await Ticket.findOne({ raffleId: raffle._id }).sort({ number: -1 });
      const startNumber = 1;
      
      if (!lastTicket) {
        return startNumber;
      }
      
      return lastTicket.number + 1;
    }
    
    // Start server
    const PORT = 5100; // Using a different port to avoid conflicts
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      console.log('Try accessing:');
      console.log(`- http://localhost:${PORT}/api/raffles/active`);
      console.log(`- http://localhost:${PORT}/api/raffles`);
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
