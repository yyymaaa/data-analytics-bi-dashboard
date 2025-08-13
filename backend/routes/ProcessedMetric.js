// backend/routes/ProcessedMetric.js
const express = require('express');
const router = express.Router();
const ProcessedMetric = require('../models/ProcessedMetric');
const authMiddleware = require('../middleware/authMiddleware');

// GET all metrics for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const metrics = await ProcessedMetric.find({ user: req.user.id }).populate('user', 'name email role');
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single metric by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const metric = await ProcessedMetric.findById(req.params.id).populate('user', 'name email role');
    if (!metric) return res.status(404).json({ error: 'ProcessedMetric not found' });

    if (metric.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(metric);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE new metric
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { metricName, value, period, date } = req.body;
    const newMetric = new ProcessedMetric({
      user: req.user.id,
      metricName,
      value,
      period,
      date
    });
    await newMetric.save();
    res.status(201).json({ message: 'ProcessedMetric created', metric: newMetric });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE metric
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const metric = await ProcessedMetric.findById(req.params.id);
    if (!metric) return res.status(404).json({ error: 'ProcessedMetric not found' });

    if (metric.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    Object.assign(metric, req.body);
    const updated = await metric.save();
    res.json({ message: 'ProcessedMetric updated', metric: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE metric
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const metric = await ProcessedMetric.findById(req.params.id);
    if (!metric) return res.status(404).json({ error: 'ProcessedMetric not found' });

    if (metric.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await metric.remove();
    res.json({ message: 'ProcessedMetric deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
