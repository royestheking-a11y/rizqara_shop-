const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    image: { type: String, required: true },
    link: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 } // For sorting
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Carousel', carouselSchema);
