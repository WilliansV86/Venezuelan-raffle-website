// Email utility functions
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Read email configuration from environment variables
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASSWORD,
    EMAIL_FROM,
    EMAIL_FROM_NAME
  } = process.env;

  // Validate required email configuration
  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_FROM) {
    console.warn('Email configuration incomplete. Emails will not be sent.');
    return null;
  }

  // Create transporter
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT),
    secure: EMAIL_PORT === '465',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
};

// Send ticket purchase confirmation email
const sendPurchaseConfirmation = async (transaction) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('Email transporter not created. Email not sent.');
      return false;
    }

    // Extract data from transaction
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
    const emailContent = `
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

    // Send email
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sorteo Venezolano'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Confirmación de Compra - Sorteo Venezolano',
      html: emailContent
    };

    // Also send a copy to admin if ADMIN_EMAIL is set
    if (process.env.ADMIN_EMAIL) {
      mailOptions.bcc = process.env.ADMIN_EMAIL;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendPurchaseConfirmation
};
