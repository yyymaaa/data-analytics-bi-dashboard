// backend/routes/ProcessedMetric.js
const express = require('express');
const router = express.Router();
const ProcessedMetric = require('../models/ProcessedMetric');

// GET all processed metrics
router.get('/', async (req, res) => {
  try {
    const metrics = await ProcessedMetric.find().populate('user', 'name email role');
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET metric by ID
router.get('/:id', async (req, res) => {
  try {
    const metric = await ProcessedMetric.findById(req.params.id).populate('user', 'name email role');
    if (!metric) return res.status(404).json({ error: 'ProcessedMetric not found' });
    res.json(metric);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE new metric
router.post('/', async (req, res) => {
  try {
    const { user, metricName, value, period, date } = req.body;
    const newMetric = new ProcessedMetric({ user, metricName, value, period, date });
    await newMetric.save();
    res.status(201).json({ message: 'ProcessedMetric created', metric: newMetric });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE metric
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const metric = await ProcessedMetric.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!metric) return res.status(404).json({ error: 'ProcessedMetric not found' });
    res.json({ message: 'ProcessedMetric updated', metric });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE metric
router.delete('/:id', async (req, res) => {
  try {
    const metric = await ProcessedMetric.findByIdAndDelete(req.params.id);
    if (!metric) return res.status(404).json({ error: 'ProcessedMetric not found' });
    res.json({ message: 'ProcessedMetric deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
