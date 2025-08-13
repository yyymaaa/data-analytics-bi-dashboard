// backend/models/ProcessedMetric.js
//this model stores aggregated results for fast dashboard loading

const mongoose = require('mongoose');

const processedMetricSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metricName: { type: String, required: true }, // e.g., "totalSales", "bounceRate"
  value: { type: Number, required: true },
  period: { type: String }, // e.g., "daily", "weekly", "monthly"
  date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProcessedMetric', processedMetricSchema);
