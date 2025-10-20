// backend/routes/DataSource.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const RawData = require('../models/RawData');
const DataSource = require('../models/DataSource');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// Helper: save rows to RawData
async function saveRowsToRawData(rows, sourceId) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  
  const formatted = rows.map(row => ({ 
    source: sourceId,
    data: row 
  }));
  
  await RawData.insertMany(formatted);
}

// === GET ALL DATA SOURCES FOR USER ===
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    
    // Build search filter
    let filter = { user: req.user._id };
    if (search && search.trim() !== '') {
      filter.name = { $regex: search, $options: 'i' };
    }

    const sources = await DataSource.find(filter)
      .sort({ createdAt: -1 })
      .select('-fileInfo.filePath')
      .lean();

    res.json({ 
      sources,
      count: sources.length 
    });
  } catch (error) {
    console.error('Error fetching data sources:', error);
    res.status(500).json({ 
      message: 'Error fetching data sources', 
      error: error.message 
    });
  }
});

// === CSV UPLOAD ===
router.post('/upload/csv', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = path.join(__dirname, '..', req.file.path);
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => rows.push(data))
      .on('end', async () => {
        const dataSource = await DataSource.create({
          user: req.user._id,
          type: 'csv-upload',
          name: req.body.name || req.file.originalname,
          fileInfo: {
            fileName: req.file.originalname,
            filePath: filePath,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
          },
          metadata: {
            headers: rows.length > 0 ? Object.keys(rows[0]) : [],
            rowCount: rows.length
          }
        });
        
        await saveRowsToRawData(rows, dataSource._id);
        fs.unlinkSync(filePath);
        
        res.json({ 
          message: 'CSV data uploaded successfully', 
          dataSource,
          rowsSaved: rows.length 
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading CSV', error: error.message });
  }
});

// === EXCEL UPLOAD ===
router.post('/upload/excel', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = path.join(__dirname, '..', req.file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const dataSource = await DataSource.create({
      user: req.user._id,
      type: 'excel-upload',
      name: req.body.name || req.file.originalname,
      fileInfo: {
        fileName: req.file.originalname,
        filePath: filePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      },
      metadata: {
        headers: rows.length > 0 ? Object.keys(rows[0]) : [],
        rowCount: rows.length
      }
    });

    await saveRowsToRawData(rows, dataSource._id);
    fs.unlinkSync(filePath);
    
    res.json({ 
      message: 'Excel data uploaded successfully', 
      dataSource,
      rowsSaved: rows.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading Excel', error: error.message });
  }
});

// === GOOGLE ANALYTICS (SIMULATED) ===
router.post('/google-analytics', authMiddleware, async (req, res) => {
  try {
    const { name, config } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    // Simulated data
    const analyticsData = [
      { date: '2025-10-01', pageViews: 1240, users: 300 },
      { date: '2025-10-02', pageViews: 980, users: 260 },
      { date: '2025-10-03', pageViews: 1500, users: 400 },
    ];

    const dataSource = await DataSource.create({
      user: req.user._id,
      type: 'google-analytics',
      name: name,
      config: config,
      metadata: {
        headers: analyticsData.length > 0 ? Object.keys(analyticsData[0]) : [],
        rowCount: analyticsData.length
      }
    });

    await saveRowsToRawData(analyticsData, dataSource._id);

    res.json({ 
      message: 'Google Analytics data connected successfully', 
      dataSource 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error connecting Google Analytics', error: error.message });
  }
});

// === MANUAL DATA ENTRY ===
router.post('/manual', authMiddleware, async (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ message: 'Name and data are required' });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid JSON data' });
    }

    if (!Array.isArray(parsedData)) {
      return res.status(400).json({ message: 'Data must be an array of objects' });
    }

    const dataSource = await DataSource.create({
      user: req.user._id,
      type: 'manual',
      name: name,
      metadata: {
        headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : [],
        rowCount: parsedData.length
      }
    });

    await saveRowsToRawData(parsedData, dataSource._id);

    res.json({ 
      message: 'Manual dataset created successfully', 
      dataSource 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating manual dataset', error: error.message });
  }
});

module.exports = router;