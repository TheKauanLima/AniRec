require('dotenv').config();

const emailConfig = {
  // Email service configuration
  // Options: 'gmail', 'sendgrid', 'resend', 'mailgun', 'smtp'
  service: process.env.EMAIL_SERVICE || 'resend',

  // SMTP settings (for Gmail or custom SMTP)
  smtp:
  {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth:
    {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // App password for Gmail
    },
  },

  // Resend API key (recommended)
  resendApiKey: process.env.RESEND_API_KEY,

  // SendGrid API key (alternative)
  sendgridApiKey: process.env.SENDGRID_API_KEY,

  // Sender details
  from:
  {
    name: process.env.EMAIL_FROM_NAME || 'AnimeRec',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
  },

  // Frontend URL for verification links
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

module.exports = emailConfig;
