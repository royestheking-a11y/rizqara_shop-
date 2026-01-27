const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    images: [String], // Evidence
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'processed'], default: 'pending' },
    adminNote: String,
    requestDate: { type: Date, default: Date.now },
    processDate: Date,
    refundMethod: String, // e.g., 'bkash', 'original_method'
    refundTransactionId: String // ID of the refund transaction
});

module.exports = mongoose.model('Refund', refundSchema);
