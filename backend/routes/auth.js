const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationCode } = require('./verification');

const router = express.Router();

console.log('AUTH MODULE LOADED');

// Register a new user
router.post('/register', async (req, res) => {
  console.log('REGISTER ENDPOINT HIT');
  console.log('Request body:', req.body);
  
  try {
    const { name, email, password, role } = req.body;
    console.log('Processing registration for:', email);

    // Check if verified user already exists
    const existingVerifiedUser = await User.findOne({ email, isVerified: true });
    if (existingVerifiedUser) {
      console.log('User already exists and is verified');
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create or update unverified user
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed, creating/updating user...');
    
    const user = await User.findOneAndUpdate(
      { email },
      {
        name,
        password: hashedPassword,
        role,
        isVerified: false
      },
      { upsert: true, new: true }
    );
    
    console.log('User created/updated:', user);

    // Send verification code
    try {
      console.log('Attempting to send verification code...');
      await sendVerificationCode(email);
      console.log('Verification code sent successfully');
      res.status(201).json({ message: 'Verification code sent' });
    } catch (err) {
      console.error('Email failed:', err.message);
      // If email fails, delete the unverified user
      await User.deleteOne({ _id: user._id });
      console.log('User deleted due to email failure');
      res.status(500).json({ error: 'Failed to send verification code: ' + err.message });
    }

  } catch (err) {
    console.error("ERROR /register:", err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('LOGIN ENDPOINT HIT');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;
    console.log('Attempting login for:', email);
    
    const user = await User.findOne({ email });
    console.log('User found:', user);
    
    if (!user || !user.isVerified) {
      console.log('Login failed: User not found or not verified');
      return res.status(400).json({ error: 'Invalid credentials or account not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Login successful, token generated');
    res.json({ token, role: user.role, isVerified: user.isVerified });
  } catch (err) {
    console.error("ERROR /login:", err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;