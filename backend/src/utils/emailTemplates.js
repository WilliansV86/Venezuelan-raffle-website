/**
 * Email Templates for the Venezuelan Raffle Website
 * Modern, minimalist designs for transaction emails
 */

/**
 * Generate approval email template with a modern minimalist design
 * @param {string} userName - The name of the user
 * @param {string} raffleName - The name of the raffle
 * @param {Array} ticketNumbers - Array of ticket numbers
 * @returns {string} HTML content for the email
 */
const generateApprovalEmail = (userName, raffleName, ticketNumbers) => {
  // Join ticket numbers with proper spacing for display
  const formattedTickets = ticketNumbers.join(', ');
  
  // Convert ticket numbers to a more visually appealing format
  const ticketDisplay = ticketNumbers.map(ticket => 
    `<span style="display:inline-block; background-color:#2563eb; color:white; padding:6px 12px; margin:5px; border-radius:4px; font-size:18px; font-weight:bold;">${ticket}</span>`
  ).join(' ');
  
  // Logo URL - using a logo from your domain or a CDN service
  // Since we don't know the exact hosted domain, use a data URL for reliable email display
  const logoUrl = 'http://localhost:3000/images/logo-lt-final.png'; // In production, change to your actual domain
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Compra</title>
  <style>
    /* Modern minimalist style */
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 0;
    }
    .header {
      background-color: #2563eb;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 10px 0 0;
      font-weight: 300;
      font-size: 24px;
      letter-spacing: 0.5px;
    }
    .logo {
      max-width: 150px;
      height: auto;
      margin: 0 auto;
      display: block;
    }
    .content {
      padding: 30px 20px;
      background-color: #ffffff;
    }
    .ticket-container {
      background-color: #f1f5f9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
      border-left: 5px solid #2563eb;
    }
    .ticket-title {
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 15px;
    }
    .ticket-numbers {
      font-family: 'Courier New', monospace;
      font-size: 16px;
      letter-spacing: 1px;
      line-height: 2;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #6b7280;
      background-color: #f8f9fa;
      border-top: 1px solid #e5e7eb;
    }
    .social-links {
      margin: 15px 0;
    }
    .social-icon {
      display: inline-block;
      margin: 0 10px;
      width: 32px;
      height: 32px;
      background-color: #2563eb;
      border-radius: 50%;
      text-align: center;
      line-height: 32px;
    }
    .social-icon a {
      color: white;
      text-decoration: none;
    }
    .message {
      font-size: 16px;
      margin-bottom: 24px;
    }
    .highlight {
      color: #2563eb;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 24px; font-weight: bold; color: white; margin-bottom: 10px;">Tu Suerte Está Aquí</div>
      <h1>¡Tu compra ha sido aprobada!</h1>
    </div>
    <div class="content">
      <p class="message">Hola ${userName || 'Estimado Cliente'},</p>
      <p class="message">Nos complace informarte que tu pago para la rifa <span class="highlight">"${raffleName}"</span> ha sido verificado y aprobado.</p>
      
      <div class="ticket-container">
        <p class="ticket-title">Tus números de ticket son:</p>
        <div class="ticket-numbers">${ticketDisplay}</div>
      </div>
      
      <p>Guarda este correo como comprobante de tu participación.</p>
      <p>Los resultados se anunciarán según lo programado para esta rifa.</p>
      <p>¡Mucha suerte!</p>
      <br>
      <p>Atentamente,<br>El equipo de Tu Suerte Está Aquí</p>
    </div>
    <div class="footer">
      <div class="social-links">
        <span class="social-icon"><a href="https://www.facebook.com/profile.php?id=Tusuerte%20Estaaqui" title="Facebook">f</a></span>
        <span class="social-icon"><a href="https://instagram.com/tusuerteestaaquive" title="Instagram">i</a></span>
        <span class="social-icon"><a href="https://tiktok.com/@tusuerte.estaaqui" title="TikTok">t</a></span>
        <span class="social-icon"><a href="https://wa.me/584241378533" title="WhatsApp">w</a></span>
      </div>
      <p>© ${new Date().getFullYear()} Tu Suerte Está Aquí. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  generateApprovalEmail
};
