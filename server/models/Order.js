const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    id: String,
    title_en: String,
    title_bn: String,
    price: Number,
    discount_price: Number, // Discounted price if any
    quantity: Number,
    images: [String],
    selectedVariant: String,
    customText: String,
    customImage: String,
    customNote: String,
    category: String
});

const orderSchema = new mongoose.Schema({
    invoiceNo: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to User
    userId: String, // Keep string ID for frontend compatibility
    userName: String,
    userPhone: String,
    items: [orderItemSchema],
    total: Number,
    subtotal: Number,
    deliveryFee: Number,
    voucherCode: String,
    voucherDiscount: { type: Number, default: 0 },
    shippingAddress: {
        details: String,
        district: String,
        upazila: String,
        phone: String,
        recipientName: String // Added
    },
    paymentMethod: String,
    trxId: String, // Store customer submitted TrxID
    paymentStatus: { type: String, default: 'pending' }, // pending, verified, failed
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund-requested', 'refunded']
    },
    trackingCode: String,
    trackingHistory: [{
        status: String,
        date: Date,
        note: String
    }],
    date: { type: Date, default: Date.now }
}, {
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Order', orderSchema);
