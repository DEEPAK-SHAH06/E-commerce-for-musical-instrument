// src/services/emailService.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const port = parseInt(process.env.EMAIL_PORT || '465');
const secure = port === 465;

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: port,
  secure: secure,
  auth: {
    user: process.env.EMAIL_HOST_USER || 'code.deepak007@gmail.com',
    pass: process.env.EMAIL_HOST_PASSWORD || ''
  }
});

const senderEmail = process.env.EMAIL_HOST_USER || 'code.deepak007@gmail.com';

/**
 * Send an email using Nodemailer
 * Falls back gracefully to console logging if SMTP fails or is unconfigured.
 */
async function sendEmail({ to, subject, html, text }) {
  const mailOptions = {
    from: `"Soundora Music Store" <${senderEmail}>`,
    to,
    subject,
    text,
    html
  };

  // Check if SMTP is configured with actual values (not placeholder)
  const isSmtpConfigured = 
    process.env.EMAIL_HOST_PASSWORD && 
    process.env.EMAIL_HOST_PASSWORD !== 'gmrtmwpkwfimelxn';

  if (!isSmtpConfigured) {
    console.log('\n==================================================');
    console.log('✉️  [LOCAL EMAIL LOG - SMTP NOT FULLY CONFIGURED]');
    console.log(`From: ${mailOptions.from}`);
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log('--------------------------------------------------');
    console.log(`Text Body:\n${text}`);
    console.log('==================================================\n');
    return { success: true, loggedLocally: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error.message);
    console.log('\n==================================================');
    console.log('✉️  [LOCAL EMAIL FALLBACK LOG]');
    console.log(`From: ${mailOptions.from}`);
    console.log(`To: ${mailOptions.to}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log('--------------------------------------------------');
    console.log(`Text Body:\n${text}`);
    console.log('==================================================\n');
    return { success: false, error: error.message, loggedLocally: true };
  }
}

/**
 * Send Order Delivered Email
 */
async function sendOrderDeliveredEmail(userEmail, userName, order) {
  const subject = `Your Order #${order.id.substring(0, 8).toUpperCase()} Has Been Delivered! 🎸`;
  
  const text = `Hello ${userName},\n\nYour order has been delivered! Thank you for shopping with Soundora.\n\nOrder Details:\nOrder ID: ${order.id}\nTotal Amount: $${parseFloat(order.total_price).toFixed(2)}\n\nBest regards,\nSoundora Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Delivered</title>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f5f7fa; color: #333333; margin: 0; padding: 20px; }
        .container { max-width: 600px; background-color: #ffffff; margin: 0 auto; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .logo { font-size: 24px; font-weight: bold; color: #1890ff; margin-bottom: 20px; text-align: center; }
        .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; text-align: center; color: #262626; }
        .divider { border-top: 1px solid #f0f0f0; margin: 24px 0; }
        .order-info { background-color: #fafafa; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
        .order-info td { padding: 4px 8px; }
        .footer { font-size: 12px; color: #8c8c8c; text-align: center; margin-top: 40px; }
        .badge { display: inline-block; background-color: #52c41a; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-weight: 500; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🎵 Soundora</div>
        <div class="header">Your Order Has Been Delivered! 🚀</div>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>We are excited to let you know that your order has been delivered successfully. We hope you enjoy your new musical instrument(s)!</p>
        
        <div class="divider"></div>
        
        <div class="order-info">
          <table style="width: 100%;">
            <tr>
              <td style="font-weight: 500; width: 120px;">Order ID:</td>
              <td><code>${order.id}</code></td>
            </tr>
            <tr>
              <td style="font-weight: 500;">Status:</td>
              <td><span class="badge">DELIVERED</span></td>
            </tr>
            <tr>
              <td style="font-weight: 500;">Total Amount:</td>
              <td style="color: #f5222d; font-weight: bold;">$${parseFloat(order.total_price).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-weight: 500;">Date:</td>
              <td>${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <p>Thank you for choosing Soundora. If you have any questions or feedback about your purchase, feel free to reply to this email or contact our support team.</p>
        
        <div class="divider"></div>
        
        <div class="footer">
          <p>© 2026 Soundora Premium Musical Instruments. All rights reserved.</p>
          <p>This is an automated notification. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html, text });
}

async function sendPasswordResetEmail(userEmail, userName, resetLink) {
  const subject = 'Reset Your Soundora Account Password 🔑';
  
  const text = `Hello ${userName},\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nBest regards,\nSoundora Team`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f5f7fa; color: #333333; margin: 0; padding: 20px; }
        .container { max-width: 600px; background-color: #ffffff; margin: 0 auto; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .logo { font-size: 24px; font-weight: bold; color: #1890ff; margin-bottom: 20px; text-align: center; }
        .header { font-size: 20px; font-weight: bold; margin-bottom: 20px; text-align: center; color: #262626; }
        .divider { border-top: 1px solid #f0f0f0; margin: 24px 0; }
        .btn { display: block; width: 200px; margin: 30px auto; padding: 12px 24px; background-color: #1890ff; color: #ffffff !important; text-align: center; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { font-size: 12px; color: #8c8c8c; text-align: center; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🎵 Soundora</div>
        <div class="header">Password Reset Request 🔑</div>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>We received a request to reset the password for your Soundora account. Click the button below to set a new password:</p>
        
        <a href="${resetLink}" class="btn">Reset Password</a>
        
        <p style="font-size: 13px; color: #8c8c8c; text-align: center;">Or copy and paste this link in your browser:<br><a href="${resetLink}">${resetLink}</a></p>
        
        <p><strong>Note:</strong> This link is only valid for 1 hour. If you did not request this change, please ignore this email and your password will remain unchanged.</p>
        
        <div class="divider"></div>
        
        <div class="footer">
          <p>© 2026 Soundora Premium Musical Instruments. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: userEmail, subject, html, text });
}

module.exports = {
  sendEmail,
  sendOrderDeliveredEmail,
  sendPasswordResetEmail,
};
