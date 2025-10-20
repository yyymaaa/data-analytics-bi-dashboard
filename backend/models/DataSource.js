// backend/models/DataSource.js
//this model keeps track of each connected or uploaded data source

// backend/models/DataSource.js
const mongoose = require('mongoose');

const dataSourceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Source type — expanded
  type: {
    type: String,
    enum: ['google-analytics', 'csv-upload', 'excel-upload', 'manual'], // Add 'manual'
    required: true
  },

  // Display name for the dataset
  name: { type: String, required: true },

  // Connection info, metadata, upload details, etc.
  config: { type: Object },

  // Store file upload details (for local files)
  fileInfo: {
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String
  },

  // Optional metadata summary (column headers, etc.)
  metadata: {
    headers: [String],
    rowCount: Number
  }

}, { timestamps: true });

module.exports = mongoose.model('DataSource', dataSourceSchema);