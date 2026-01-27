const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Can be 'admin' or specific userId
    title_bn: String,
    title_en: String,
    body_bn: String,
    body_en: String,
    type: { type: String, enum: ['order', 'payment', 'delivery', 'message', 'general'], default: 'general' },
    link: String,
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
