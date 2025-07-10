/**
 * Email service for sending raffle confirmations
 */

const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const https = require('https');
const Transaction = require('../models/Transaction');
const Participant = require('../models/Participant');
const Raffle = require('../models/Raffle');

// Check if we're using SendGrid
const isUsingSendGrid = process.env.EMAIL_PROVIDER === 'sendgrid';
if (isUsingSendGrid) {
  console.log('Using SendGrid as email provider');
} else {
  console.log('Using SMTP as email provider');
}

// Set up email logging for development mode
const logDir = path.join(__dirname, '../../logs');
const emailLogPath = path.join(logDir, 'email_logs.json');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create empty email logs file if it doesn't exist
if (!fs.existsSync(emailLogPath)) {
  fs.writeFileSync(emailLogPath, JSON.stringify([], null, 2));
}

// Helper function to log emails in development mode
const logEmail = (emailData) => {
  try {
    // Read existing logs
    const logs = JSON.parse(fs.readFileSync(emailLogPath, 'utf8'));
    
    // Add new log with timestamp
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...emailData
    };
    
    logs.push(logEntry);
    
    // Write updated logs
    fs.writeFileSync(emailLogPath, JSON.stringify(logs, null, 2));
    
    console.log(`Email logged to ${emailLogPath}`);
    return { messageId: `dev-${Date.now()}`, success: true };
  } catch (error) {
    console.error('Error logging email:', error);
    return { error: 'Failed to log email', success: false };
  }
};

// SendGrid email sending function
const sendGridMail = async (options) => {
  try {
    const { to, subject, html, from } = options;
    
    // Validate SendGrid API Key
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('SendGrid API key is missing');
      return { error: 'SendGrid API key is missing', success: false };
    }
    
    // Prepare request data
    const data = JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: { email: from || process.env.EMAIL_FROM },
      content: [
        {
          type: 'text/html',
          value: html,
        },
      ],
    });
    
    // Request options for SendGrid API
    const requestOptions = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': data.length,
      },
    };
    
    // Send the request
    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        console.log(`SendGrid API response status: ${res.statusCode}`);
        
        // Process response
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Email sent successfully via SendGrid');
            resolve({ messageId: `sendgrid-${Date.now()}`, success: true });
          } else {
            console.error(`Failed to send email via SendGrid. Status: ${res.statusCode}`);
            console.error(`Response: ${responseData}`);
            resolve({ error: `SendGrid error: ${res.statusCode}`, success: false });
          }
        });
      });
      
      // Handle errors
      req.on('error', (error) => {
        console.error(`Error sending email via SendGrid: ${error.message}`);
        resolve({ error: error.message, success: false });
      });
      
      // Send the request
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error(`Error in SendGrid mailer: ${error.message}`);
    return { error: error.message, success: false };
  }
};

// Create nodemailer transporter (for SMTP) or return null if using SendGrid
const createTransporter = () => {
  // Check if we're in development mode
  if (process.env.EMAIL_DEV_MODE === 'true') {
    console.log('Running in EMAIL_DEV_MODE - emails will be logged but not sent');
    return null; // No need for a real transporter in dev mode
  }
  
  // If we're using SendGrid, we don't need a nodemailer transporter
  if (isUsingSendGrid) {
    console.log('Using SendGrid API for sending emails - no SMTP transporter needed');
    return { sendMail: sendGridMail, verify: () => Promise.resolve(true) };
  }
  
  // Otherwise, create an SMTP transporter
  console.log('Creating SMTP email transporter with settings:');
  console.log(`- Host: ${process.env.EMAIL_HOST}`);
  console.log(`- Port: ${process.env.EMAIL_PORT}`);
  console.log(`- Secure: ${process.env.EMAIL_SECURE === 'true'}`);
  console.log(`- User: ${process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 3) + '...' : 'Not set'}`);

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Enable additional debug information
    debug: true,
    // Increase timeout to 30 seconds for slow connections
    connectionTimeout: 30000
  });
};

/**
 * Send confirmation email to participant
 * @param {Object} transaction - Transaction document
 * @param {Object} participant - Participant document
 * @param {Object} raffle - Raffle document
 * @param {Array} ticketNumbers - Array of ticket numbers
 * @returns {Promise} - Email sending result
 */
const sendConfirmationEmail = async (transaction, participant, raffle, ticketNumbers) => {
  try {
    console.log(`Attempting to send confirmation email to participant: ${participant.email}`);

    const transporter = createTransporter();

    // If transporter is null, we are in dev mode. Log the email and exit.
    if (!transporter) {
      const result = logEmail({
        type: 'confirmation',
        to: participant.email,
        subject: `Confirmación de Participación en ${raffle.title}`,
        transactionId: transaction._id.toString(),
        ticketNumbers
      });
      console.log(`[DEV MODE] Confirmation email logged for ${participant.email}`);
      await Transaction.findByIdAndUpdate(transaction._id, { emailSent: true });
      return result;
    }

    // If transporter exists, proceed to send a real email.
    await transporter.verify();
    
    const paymentMethodMap = {
      'pago-movil': 'Pago Móvil',
      'zelle': 'Zelle',
      'binance': 'Binance'
    };
    const paymentMethod = paymentMethodMap[transaction.paymentMethod] || transaction.paymentMethod;
    const drawDate = new Date(raffle.drawDate).toLocaleDateString('es-VE', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    
    const emailContent = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sorteo Venezolano'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
      to: participant.email,
      subject: `Confirmación de Participación en ${raffle.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #0284c7;">¡Hola ${participant.fullName}!</h2>
          <p>¡Gracias por participar en nuestro sorteo! Hemos recibido tu pago de <strong>${transaction.paymentAmount} ${transaction.paymentMethod === 'pago-movil' ? 'Bs' : 'USD'}</strong> a través de <strong>${paymentMethod}</strong>.</p>
          <p>Tus números de ticket asignados son:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 15px 0;">
            ${ticketNumbers.map(number => `<span style="display: inline-block; background-color: #0284c7; color: white; padding: 8px 12px; margin: 5px; border-radius: 5px; font-weight: bold;">🎟️ ${number}</span>`).join('')}
          </div>
          <p>El sorteo se llevará a cabo el <strong>${drawDate}</strong>.</p>
          <p>¡Te deseamos mucha suerte!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">— El Equipo de ${raffle.title}</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(emailContent);
    console.log(`Confirmation email sent to ${participant.email}`, result.messageId);
    
    await Transaction.findByIdAndUpdate(transaction._id, { emailSent: true });
    
    return result;

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

/**
 * Process pending confirmation emails
 * This should be run on a schedule (e.g., every hour)
 * @returns {Object} Statistics about processed emails
 */
const processPendingEmails = async () => {
  // Initialize statistics counters
  const stats = {
    processed: 0,
    success: 0,
    failed: 0,
    transactions: []
  };
  
  try {
    const now = new Date();
    
    // Find transactions where:
    // 1. Email is scheduled for before now
    // 2. Email hasn't been sent yet
    // 3. Status is confirmed
    const pendingTransactions = await Transaction.find({
      emailScheduledFor: { $lte: now },
      emailSent: false,
      status: 'confirmed'
    }).populate('participant raffle tickets');
    
    stats.processed = pendingTransactions.length;
    console.log(`Found ${pendingTransactions.length} pending confirmation emails to send`);
    
    for (const transaction of pendingTransactions) {
      try {
        // Skip if missing necessary data
        if (!transaction.participant || !transaction.raffle || !transaction.tickets) {
          console.error(`Transaction ${transaction._id} missing required relations. Skipping.`);
          stats.failed++;
          stats.transactions.push({
            id: transaction._id,
            success: false,
            error: 'Missing required relations'
          });
          continue;
        }
        
        const ticketNumbers = transaction.tickets.map(ticket => ticket.number || '');
        
        // Skip if there are no valid ticket numbers
        if (!ticketNumbers.length) {
          console.error(`Transaction ${transaction._id} has no ticket numbers. Skipping.`);
          stats.failed++;
          stats.transactions.push({
            id: transaction._id,
            success: false,
            error: 'No ticket numbers available'
          });
          continue;
        }
        
        // Attempt to send email
        const emailResult = await sendConfirmationEmail(
          transaction,
          transaction.participant,
          transaction.raffle,
          ticketNumbers
        );
        
        if (emailResult.success) {
          // Update transaction to mark email as sent
          transaction.emailSent = true;
          transaction.emailSentAt = new Date();
          await transaction.save();
          
          console.log(`Confirmation email sent for transaction ${transaction._id}`);
          stats.success++;
          stats.transactions.push({
            id: transaction._id,
            success: true
          });
        } else {
          console.error(`Failed to send email for transaction ${transaction._id}:`, emailResult.error);
          stats.failed++;
          stats.transactions.push({
            id: transaction._id,
            success: false,
            error: emailResult.error || 'Unknown error'
          });
        }
      } catch (emailError) {
        console.error(`Failed to process email for transaction ${transaction._id}:`, emailError);
        stats.failed++;
        stats.transactions.push({
          id: transaction._id,
          success: false,
          error: emailError.message || 'Exception while processing'
        });
      }
    }
  } catch (error) {
    console.error('Error processing pending emails:', error);
  }
  
  return stats;
};

/**
 * Send notification email to admin
 * @param {Object} transaction - Transaction document
 * @param {Object} participant - Participant document
 * @param {Object} raffle - Raffle document
 * @param {Array} ticketNumbers - Array of ticket numbers
 * @returns {Promise} - Email sending result
 */
const sendAdminNotification = async (transaction, participant, raffle, ticketNumbers) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.log('No admin email configured. Skipping admin notification.');
      return null;
    }

    console.log(`Attempting to send admin notification to: ${adminEmail}`);

    const transporter = createTransporter();

    // If transporter is null, we are in dev mode. Log the email and exit.
    if (!transporter) {
      const result = logEmail({
        type: 'admin_notification',
        to: adminEmail,
        subject: `Nueva Compra de Tickets: ${participant.fullName}`,
        transactionId: transaction._id.toString(),
        ticketNumbers
      });
      console.log(`[DEV MODE] Admin notification logged for ${adminEmail}`);
      return result;
    }

    // If transporter exists, proceed to send a real email.
    await transporter.verify();

    const paymentMethodMap = {
      'pago-movil': 'Pago Móvil',
      'zelle': 'Zelle',
      'binance': 'Binance'
    };
    const paymentMethod = paymentMethodMap[transaction.paymentMethod] || transaction.paymentMethod;
    const drawDate = new Date(raffle.drawDate).toLocaleDateString('es-VE', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const purchaseDate = new Date().toLocaleDateString('es-VE', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const emailContent = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sorteo Venezolano'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
      to: adminEmail,
      subject: `Nueva Compra de Tickets: ${participant.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #0284c7;">¡Nueva Venta de Tickets!</h2>
          <p>Se ha registrado una nueva compra de tickets para el sorteo <strong>${raffle.title}</strong>.</p>
          <h3>Detalles de la Compra:</h3>
          <ul style="background-color: #f4f4f4; padding: 15px; border-radius: 8px;">
            <li><strong>Nombre:</strong> ${participant.fullName}</li>
            <li><strong>Email:</strong> ${participant.email}</li>
            <li><strong>WhatsApp:</strong> ${participant.whatsappNumber}</li>
            <li><strong>Cédula:</strong> ${participant.identificationNumber}</li>
            <li><strong>Método de Pago:</strong> ${paymentMethod}</li>
            <li><strong>Monto:</strong> ${transaction.paymentAmount} ${transaction.paymentMethod === 'pago-movil' ? 'Bs' : 'USD'}</li>
            <li><strong>Referencia:</strong> ${transaction.paymentReference}</li>
            <li><strong>Fecha de Compra:</strong> ${purchaseDate}</li>
          </ul>
          <h3>Tickets Asignados:</h3>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 15px 0;">
            ${ticketNumbers.map(number => `<span style="display: inline-block; background-color: #0284c7; color: white; padding: 8px 12px; margin: 5px; border-radius: 5px; font-weight: bold;">🎟️ ${number}</span>`).join('')}
          </div>
          <p>Total de Tickets: <strong>${ticketNumbers.length}</strong></p>
          <p>Fecha del Sorteo: <strong>${drawDate}</strong></p>
          <p style="margin-top: 30px;">Puede ver todos los detalles en el panel de administración.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">— Sistema de Notificaciones de ${process.env.EMAIL_FROM_NAME || 'Sorteo Venezolano'}</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(emailContent);
    console.log(`Admin notification sent to ${adminEmail}`, result.messageId);
    return result;

  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
};

/**
 * Test the email configuration
 * @returns {Promise} - Test result
 */
const testEmailConfig = async () => {
  try {
    console.log('Testing email configuration...');
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    console.log('SMTP connection successful!');
    
    return { success: true, message: 'Email configuration is correct' };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return { success: false, message: error.message, error };
  }
};

module.exports = {
  sendConfirmationEmail,
  sendAdminNotification,
  processPendingEmails,
  testEmailConfig
};
