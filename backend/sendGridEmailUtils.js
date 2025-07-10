// SendGrid Email utility functions
const https = require('https');

/**
 * Send an email using the SendGrid API
 * @param {Object} options - Email options
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async (options) => {
  try {
    const { to, subject, html, from } = options;
    
    // Validate SendGrid API Key
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.error('SendGrid API key is missing');
      return false;
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
            console.log('Email sent successfully');
            resolve(true);
          } else {
            console.error(`Failed to send email. Status: ${res.statusCode}`);
            console.error(`Response: ${responseData}`);
            resolve(false);
          }
        });
      });
      
      // Handle errors
      req.on('error', (error) => {
        console.error(`Error sending email: ${error.message}`);
        resolve(false);
      });
      
      // Send the request
      req.write(data);
      req.end();
    });
  } catch (error) {
    console.error(`Error in sendEmail: ${error.message}`);
    return false;
  }
};

/**
 * Send purchase confirmation email
 * @param {Object} transaction - Transaction data
 * @returns {Promise<boolean>} - Success status
 */
const sendPurchaseConfirmation = async (transaction) => {
  try {
    // Extract transaction data
    const {
      _id,
      fullName,
      email,
      whatsappNumber,
      quantity,
      paymentAmount,
      paymentMethod,
      paymentReference,
      status
    } = transaction;

    // Format ticket price
    const ticketPrice = paymentAmount / quantity / 100; // Convert cents to dollars

    // Create email content
    const html = `
      <h2>Confirmación de Compra - Sorteo Venezolano</h2>
      <p>Hola <strong>${fullName}</strong>,</p>
      <p>¡Gracias por tu compra! Hemos recibido tu solicitud para ${quantity} boleto(s) del sorteo.</p>
      
      <h3>Detalles de tu compra:</h3>
      <ul>
        <li><strong>ID de Transacción:</strong> ${_id}</li>
        <li><strong>Cantidad de boletos:</strong> ${quantity}</li>
        <li><strong>Precio por boleto:</strong> $${ticketPrice.toFixed(2)} USD</li>
        <li><strong>Total pagado:</strong> $${(paymentAmount / 100).toFixed(2)} USD</li>
        <li><strong>Método de pago:</strong> ${paymentMethod}</li>
        <li><strong>Referencia de pago:</strong> ${paymentReference}</li>
        <li><strong>Estado:</strong> ${status === 'pending' ? 'Pendiente de verificación' : status}</li>
      </ul>
      
      <p>Una vez que verifiquemos tu pago, te enviaremos los números de tus boletos.</p>
      <p>Si tienes alguna pregunta, puedes contactarnos respondiendo a este correo.</p>
      
      <p>¡Buena suerte!</p>
      <p>Equipo de Sorteo Venezolano</p>
    `;

    // Prepare email options
    const options = {
      to: email,
      subject: 'Confirmación de Compra - Sorteo Venezolano',
      html,
      from: process.env.EMAIL_FROM || 'sorteo@venezuelanraffle.com'
    };

    // Also send a copy to admin if ADMIN_EMAIL is set
    if (process.env.ADMIN_EMAIL) {
      // Send copy to admin separately
      const adminOptions = {
        ...options,
        to: process.env.ADMIN_EMAIL,
        subject: `[ADMIN] Nueva compra - ${fullName}`
      };
      // No need to await, just send it
      sendEmail(adminOptions);
    }

    // Send to customer and return result
    return await sendEmail(options);
  } catch (error) {
    console.error(`Error sending purchase confirmation: ${error.message}`);
    return false;
  }
};

/**
 * Send a test email
 * @param {string} recipient - Recipient email address
 * @returns {Promise<boolean>} - Success status
 */
const sendTestEmail = async (recipient) => {
  try {
    const options = {
      to: recipient,
      subject: 'Test Email from Venezuelan Raffle Website',
      html: `
        <h2>Test Email - Sorteo Venezolano</h2>
        <p>This is a test email from your Venezuelan Raffle Website.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `,
      from: process.env.EMAIL_FROM || 'sorteo@venezuelanraffle.com'
    };
    
    return await sendEmail(options);
  } catch (error) {
    console.error(`Error sending test email: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendPurchaseConfirmation,
  sendTestEmail
};
