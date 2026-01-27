const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Keep string ID for compatibility with frontend logic if needed, or rely on _id
    title_en: { type: String, required: true },
    title_bn: String,
    desc_en: String,
    desc_bn: String,
    price: { type: Number, required: true },
    regular_price: Number,
    discount_price: Number,
    stock: { type: Number, default: 0 },
    category: String,
    subCategory: String, // New field
    itemType: String,    // New field (for 3rd level like Jute -> Bags)
    images: [String], // URL strings from Cloudinary
    colors: [String],
    sizes: [String],
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
