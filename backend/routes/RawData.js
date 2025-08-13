// backend/routes/RawData.js
const express = require('express');
const router = express.Router();
const RawData = require('../models/RawData');
const DataSource = require('../models/DataSource');
const authMiddleware = require('../middleware/authMiddleware');

// GET all raw data for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Only fetch raw data from sources owned by this user
    const raw = await RawData.find()
      .populate({
        path: 'source',
        match: { user: req.user.id }
      });

    // Filter out any null sources (not owned by this user)
    const filtered = raw.filter(r => r.source !== null);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single raw data by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const raw = await RawData.findById(req.params.id).populate('source');
    if (!raw) return res.status(404).json({ error: 'RawData not found' });

    if (raw.source.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(raw);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE new raw data
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { source, data } = req.body;

    // Check ownership
    const src = await DataSource.findById(source);
    if (!src) return res.status(404).json({ error: 'DataSource not found' });
    if (src.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const newRaw = new RawData({ source, data });
    await newRaw.save();
    res.status(201).json({ message: 'RawData created', raw: newRaw });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE raw data
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const raw = await RawData.findById(req.params.id).populate('source');
    if (!raw) return res.status(404).json({ error: 'RawData not found' });

    if (raw.source.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    Object.assign(raw, req.body);
    const updated = await raw.save();
    res.json({ message: 'RawData updated', raw: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE raw data
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const raw = await RawData.findById(req.params.id).populate('source');
    if (!raw) return res.status(404).json({ error: 'RawData not found' });

    if (raw.source.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await raw.remove();
    res.json({ message: 'RawData deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
