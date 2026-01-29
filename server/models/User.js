const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    id: String,
    label: String,
    recipientName: String, // Added
    phone: String, // Added
    details: String,
    district: String,
    upazila: String,
    isDefault: Boolean,
});

const reminderSchema = new mongoose.Schema({
    id: String,
    title: String,
    date: String, // Changed from Date to String to avoid casting issues
    type: String
}, { _id: false });

const userSchema = new mongoose.Schema({
    id: String, // Custom ID for frontend compatibility
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    role: { type: String, default: 'customer', enum: ['customer', 'admin'] },
    addresses: [addressSchema],
    profileImage: String,
    failedDeliveries: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
    bannedReason: String,
    isDeleted: { type: Boolean, default: false },
    wishlist: [String], // Array of Product IDs
    cart: [{
        id: String,
        productId: String,
        title_bn: String,
        title_en: String,
        price: Number,
        image: String,
        quantity: Number,
        selectedVariant: String,
        customText: String,
        customImage: String,
        customNote: String
    }],
    reminders: [reminderSchema],
    pushSubscriptions: [mongoose.Schema.Types.Mixed],
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema);
