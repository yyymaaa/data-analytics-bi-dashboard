// backend/routes/DataSource.js
const express = require('express');
const router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const DataSource = require('../models/DataSource');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const RawData = require('../models/RawData');

const upload = multer({dest: 'uploads/'}); //files will temporarily go into /uploads folder


// GET all data sources for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sources = await DataSource.find({ user: req.user.id }).populate('user', 'name email role');
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single data source by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id).populate('user', 'name email role');
    if (!source) return res.status(404).json({ error: 'DataSource not found' });

    // Ensure the logged-in user owns the data source
    if (source.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(source);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE a new data source
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, name, config } = req.body;
    const newSource = new DataSource({
      user: req.user.id, // owner from token
      type,
      name,
      config
    });
    await newSource.save();
    res.status(201).json({ message: 'DataSource created', source: newSource });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE data source
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id);
    if (!source) return res.status(404).json({ error: 'DataSource not found' });

    // Ensure the logged-in user owns the data source
    if (source.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    Object.assign(source, req.body);
    const updated = await source.save();
    res.json({ message: 'DataSource updated', source: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE data source
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id);
    if (!source) return res.status(404).json({ error: 'DataSource not found' });

    // Ensure the logged-in user owns the data source
    if (source.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await source.remove();
    res.json({ message: 'DataSource deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

//CSV upload route
router.post('/:id/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const source = await DataSource.findById(req.params.id);
    if (!source) return res.status(404).json({error: 'DataSource not found'});
    if (source.user.toString() !== req.user.id) {
      return res.status(403).json({error: 'Forbidden'});
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded'});
    }
    const results = [];
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      results.push({
        source: source._id,
        user: req.user.id,
        data: row
      });
    })
    .on('end', async () => {
      //save the rows into RawData
      await RawData.insertMany(results);

      //delete the temporary file
      fs.unlinkSync(req.file.path);
      res.json({ message: 'CSV uploaded and saved', rows: results.length});
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
