const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: String,
    userId: String,
    userName: String,
    userAvatar: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    images: [String],
    isVerifiedPurchase: Boolean
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Review', reviewSchema);
