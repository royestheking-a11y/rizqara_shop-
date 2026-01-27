const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'BDT' },
    method: { type: String, enum: ['bkash', 'nagad', 'rocket', 'bank_transfer', 'cod', 'card'], required: true },
    transactionId: String, // from gateway or manual entry
    status: { type: String, enum: ['pending', 'verified', 'failed', 'refunded'], default: 'pending' },
    screenshot: String, // for manual verification
    date: { type: Date, default: Date.now },
    verifiedBy: String // Admin ID
});

module.exports = mongoose.model('Payment', paymentSchema);
