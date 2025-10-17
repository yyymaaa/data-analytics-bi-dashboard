//backend/routes.dashboard.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Sample protected route
router.get('/metrics', authMiddleware, (req, res) => {
  // For now, return a dummy response
  res.json({
    message: 'This is a protected dashboard metrics route',
    user: req.user
  });
});

module.exports = router;
