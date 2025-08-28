// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const RawData = require('./models/RawData');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware - MUST come after app is defined!
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log('=== INCOMING REQUEST ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Body:', req.body);
  console.log('=========================');
  next();
});


// Routes 
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const { router: verificationRoutes } = require('./routes/verification'); 
app.use('/api/verification', verificationRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const userRoutes = require('./routes/User');
app.use('/api/user', userRoutes);

const dataSourceRoutes = require('./routes/DataSource');
app.use('/api/datasource', dataSourceRoutes);

const processedMetricRoutes = require('./routes/ProcessedMetric');
app.use('/api/processedmetric', processedMetricRoutes);

const rawDataRoutes = require('./routes/RawData');
app.use('/api/rawdata', rawDataRoutes);

const dashboardConfigRoutes = require('./routes/DashboardConfig');
app.use('/api/dashboardconfig', dashboardConfigRoutes);


const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-csv', authMiddleware, upload.single('file'), (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
  .pipe(csvParser())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    try {
      await RawData.insertMany(
        results.map(row =>({
          user: req.user.id,
          source: 'csv-upload',
          data: row
        }))
      );

      fs.unlinkSync(filePath);

      res.json({message: 'CSV uploaded and processed', count: results.length  });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error processing CSV' });
    }
  });
});

// Connect to MongoDB 
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test route 
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Start server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));