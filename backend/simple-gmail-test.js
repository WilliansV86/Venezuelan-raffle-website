// Simple Gmail Test - Run directly with node
require('dotenv').config();
const nodemailer = require('nodemailer');

// Log environment variables
console.log('Gmail User:', process.env.GMAIL_USER);
console.log('Gmail Pass length:', process.env.GMAIL_PASS ? process.env.GMAIL_PASS.length : 'Not set');

// Create transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Mail options
const mailOptions = {
  from: process.env.GMAIL_USER,
  to: process.env.GMAIL_USER, // Send to self
  subject: 'Simple Gmail Test',
  html: '<h1>Test Email</h1><p>This is a simple test at ' + new Date().toString() + '</p>'
};

// Send mail
console.log('Attempting to send email...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('FAILED TO SEND EMAIL:');
    console.error(error);
    
    if (error.code === 'EAUTH') {
      console.log('\nLikely causes:');
      console.log('1. App password is incorrect (should be 16 characters, no spaces)');
      console.log('2. "Less secure app access" is not enabled');
      console.log('3. Gmail is blocking the login attempt as suspicious');
    }
  } else {
    console.log('Email sent successfully!');
    console.log('Response:', info.response);
  }
});
