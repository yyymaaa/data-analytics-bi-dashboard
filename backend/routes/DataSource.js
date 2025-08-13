// backend/routes/DataSource.js
const express = require('express');
const router = express.Router();
const DataSource = require('../models/DataSource');

// GET all data sources
router.get('/', async (req, res) => {
  try {
    const sources = await DataSource.find().populate('user', 'name email role');
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET data source by ID
router.get('/:id', async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id).populate('user', 'name email role');
    if (!source) return res.status(404).json({ error: 'DataSource not found' });
    res.json(source);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE a new data source
router.post('/', async (req, res) => {
  try {
    const { user, type, name, config } = req.body;
    const newSource = new DataSource({ user, type, name, config });
    await newSource.save();
    res.status(201).json({ message: 'DataSource created', source: newSource });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE data source
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const source = await DataSource.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!source) return res.status(404).json({ error: 'DataSource not found' });
    res.json({ message: 'DataSource updated', source });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE data source
router.delete('/:id', async (req, res) => {
  try {
    const source = await DataSource.findByIdAndDelete(req.params.id);
    if (!source) return res.status(404).json({ error: 'DataSource not found' });
    res.json({ message: 'DataSource deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
