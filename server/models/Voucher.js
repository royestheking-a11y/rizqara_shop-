const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true }, // Percentage
    description_bn: String,
    description_en: String,
    minPurchase: { type: Number, default: 0 },
    maxDiscount: Number,
    validUntil: Date,
    isActive: { type: Boolean, default: true },
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    usedByUsers: [{ type: String }] // Track user IDs who have used this voucher
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Voucher', voucherSchema);
