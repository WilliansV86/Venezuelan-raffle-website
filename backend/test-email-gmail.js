const nodemailer = require('nodemailer');

// Gmail SMTP configuration
// Note: For this to work, you'll need to:
// 1. Enable "Less secure app access" in your Google account, or
// 2. Create an app password if you have 2FA enabled
const GMAIL_USER = "tusuerteestaaquive@gmail.com"; // Replace with your Gmail address
const GMAIL_PASS = "your-gmail-password"; // Replace with your Gmail password or app password
const RECIPIENT_EMAIL = "tusuerteestaaquive@gmail.com"; // Who should receive the test email

async function testGmailEmail() {
  console.log('--- Starting Gmail Email Test ---');

  try {
    // Create transporter with Gmail configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Uses Gmail's predefined settings
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      },
      debug: true
    });

    console.log('1. Gmail transporter created');
    console.log(`Using Gmail account: ${GMAIL_USER}`);

    const mailOptions = {
      from: `"Venezuelan Raffle" <${GMAIL_USER}>`,
      to: RECIPIENT_EMAIL,
      subject: 'Gmail Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
          <h1>Gmail Test Email</h1>
          <p>If you received this email, the Gmail configuration is working correctly.</p>
          <p>Time: ${new Date().toISOString()}</p>
        </div>
      `
    };

    console.log('2. Attempting to send email via Gmail...');

    const info = await transporter.sendMail(mailOptions);

    console.log('\n--- SUCCESS ---');
    console.log('Email sent successfully via Gmail!');
    console.log('Message ID:', info.messageId);
    if (info.response) console.log('Response:', info.response);

  } catch (error) {
    console.log('\n--- FAILED ---');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\nAuthentication failed. Please check:');
      console.log('1. Your Gmail username and password are correct');
      console.log('2. "Less secure app access" is enabled in your Google account');
      console.log('3. If you have 2FA enabled, you need to use an app password');
    }
  }
}

testGmailEmail();
