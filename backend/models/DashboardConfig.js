// backend/models/DashboardConfig.js
//this model saves each user's dashboard preferences
const mongoose = require('mongoose');

const dashboardConfigSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  widgets: { type: Array, default: [] }, // positions, types
  filters: { type: Object, default: {} },
  theme: { type: String, default: 'light' }
}, { timestamps: true });

module.exports = mongoose.model('DashboardConfig', dashboardConfigSchema);
