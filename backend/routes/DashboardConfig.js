// backend/routes/DashboardConfig.js
const express = require('express');
const router = express.Router();
const DashboardConfig = require('../models/DashboardConfig');
const authMiddleware = require('../middleware/authMiddleware');

// GET all dashboard configs for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const configs = await DashboardConfig.find({ user: req.user.id });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET a single config by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const config = await DashboardConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ error: 'DashboardConfig not found' });

    if (config.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE new dashboard config
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { widgets, filters, theme } = req.body;
    const newConfig = new DashboardConfig({
      user: req.user.id,
      widgets,
      filters,
      theme
    });
    await newConfig.save();
    res.status(201).json({ message: 'DashboardConfig created', config: newConfig });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE dashboard config
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const config = await DashboardConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ error: 'DashboardConfig not found' });

    if (config.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    Object.assign(config, req.body);
    const updated = await config.save();
    res.json({ message: 'DashboardConfig updated', config: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE dashboard config
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const config = await DashboardConfig.findById(req.params.id);
    if (!config) return res.status(404).json({ error: 'DashboardConfig not found' });

    if (config.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await config.remove();
    res.json({ message: 'DashboardConfig deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
