const nodemailer = require('nodemailer');
const User = require('../models/User');
const express = require('express');
const router = express.Router();

console.log('=== VERIFICATION MODULE LOADED ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'SET' : 'NOT SET');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');

// Create transporter with proper error handling
const createTransporter = () => {
  console.log('=== CREATING TRANSPORTER ===');
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.error('MISSING CREDENTIALS - EMAIL_USER:', !!process.env.EMAIL_USER, 'EMAIL_APP_PASSWORD:', !!process.env.EMAIL_APP_PASSWORD);
    throw new Error('Email credentials not configured');
  }

  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === "true" || false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  };
  
  console.log('Transporter config:', config);
  return nodemailer.createTransport(config);
};

// Utility function: send verification code
const sendVerificationCode = async (email) => {
  console.log('=== SEND VERIFICATION CODE CALLED ===');
  console.log('Email parameter:', email);
  
  const transporter = createTransporter();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated code:', code);

  try {
    console.log('Attempting to verify transporter...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    console.log('Updating user in database...');
    const result = await User.findOneAndUpdate(
      { email },
      { verificationCode: code },
      { upsert: true, new: true }
    );
    console.log('User updated successfully:', result);

    console.log('Preparing email...');
    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`,
      html: `<p>Your code is: <strong>${code}</strong></p>`
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully! Message ID:', info.messageId);
    
    return code;

  } catch (err) {
    console.error('ERROR in sendVerificationCode:');
    console.error('Error message:', err.message);
    throw new Error('Failed to send verification code: ' + err.message);
  }
};

// Routes
router.post('/send-verification', async (req, res) => {
  console.log('=== /send-verification ENDPOINT HIT ===');
  console.log('Request body:', req.body);
  
  const { email } = req.body;
  if (!email) {
    console.log('No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    console.log('Calling sendVerificationCode...');
    await sendVerificationCode(email);
    console.log('Verification code sent successfully');
    
    // FIX: Send proper JSON response
    res.status(200).json({ 
      message: 'Verification code sent successfully'
    });
    
  } catch (err) {
    console.error("[ERROR] /send-verification:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify-code', async (req, res) => {
  console.log('=== /verify-code ENDPOINT HIT ===');
  console.log('Request body:', req.body);
  
  const { email, code } = req.body;
  if (!email || !code) {
    console.log('Missing email or code');
    return res.status(400).json({ error: 'Email and code are required' });
  }

  try {
    console.log('Looking for user:', email);
    const user = await User.findOne({ email });
    console.log('User found:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Stored code type:', typeof user.verificationCode, 'Value:', user.verificationCode);
    console.log('Input code type:', typeof code, 'Value:', code);
    
    // Debug comparison
    const storedCode = user.verificationCode ? user.verificationCode.toString().trim() : '';
    const inputCode = code ? code.toString().trim() : '';
    console.log('Trimmed stored code:', storedCode);
    console.log('Trimmed input code:', inputCode);
    console.log('Codes match?', storedCode === inputCode);
    
    if (storedCode === inputCode) {
      console.log('Codes match! Verifying user...');
      user.isVerified = true;
      user.verificationCode = null;
      await user.save();
      console.log('User verified successfully');
      res.json({ message: 'Verification successful' });
    } else {
      console.log('Codes do not match');
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (err) {
    console.error("[ERROR] /verify-code:", err);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Export both router and function properly
module.exports = {
  router,
  sendVerificationCode
};