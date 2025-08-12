// utils/mailer.sendgrid.js
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, html) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // verified sender email
    subject,
    html
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email send error:', error.response?.body || error);
  }
}

module.exports = { sendEmail };
