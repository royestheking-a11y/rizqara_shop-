const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'sketch_pricing', 'site_config'
    value: { type: mongoose.Schema.Types.Mixed, required: true }, // Flexible structure
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Setting', settingSchema);
