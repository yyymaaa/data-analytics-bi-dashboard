// backend/models/RawData.js
//This model stores the actual raw dataset from a source
const mongoose = require('mongoose');

const rawDataSchema = new mongoose.Schema({
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource', required: true },
  data: { type: Object, required: true }, // Original dataset
}, { timestamps: true });

module.exports = mongoose.model('RawData', rawDataSchema);
