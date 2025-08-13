// backend/routes/RawData.js
const express = require('express');
const router = express.Router();
const RawData = require('../models/RawData');

// GET all raw data
router.get('/', async (req, res) => {
  try {
    const raw = await RawData.find().populate('source');
    res.json(raw);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET raw data by ID
router.get('/:id', async (req, res) => {
  try {
    const raw = await RawData.findById(req.params.id).populate('source');
    if (!raw) return res.status(404).json({ error: 'RawData not found' });
    res.json(raw);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE new raw data
router.post('/', async (req, res) => {
  try {
    const { source, data } = req.body;
    const newRaw = new RawData({ source, data });
    await newRaw.save();
    res.status(201).json({ message: 'RawData created', raw: newRaw });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE raw data
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const raw = await RawData.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!raw) return res.status(404).json({ error: 'RawData not found' });
    res.json({ message: 'RawData updated', raw });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE raw data
router.delete('/:id', async (req, res) => {
  try {
    const raw = await RawData.findByIdAndDelete(req.params.id);
    if (!raw) return res.status(404).json({ error: 'RawData not found' });
    res.json({ message: 'RawData deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
