// backend/models/DataSource.js
//this model keeps track of each connected or uploaded data source
const mongoose = require('mongoose');

const dataSourceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['google-analytics', 'aws', 'csv-upload', 'manual'], required: true },
  name: { type: String, required: true },
  config: { type: Object }, // API keys, connection details, etc.
}, { timestamps: true });

module.exports = mongoose.model('DataSource', dataSourceSchema);
