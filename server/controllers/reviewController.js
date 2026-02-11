const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get all public reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({}).sort({ date: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { productId } = req.body;

        // Verify purchase
        const order = await Order.findOne({
            userId: req.user.id,
            "items.id": productId,
            status: 'delivered'
        });

        if (!order) {
            return res.status(403).json({ message: 'আপনি শুধুমাত্র কেনা এবং প্রাপ্ত পণ্য রিভিউ করতে পারেন (You can only review products you have purchased and received)' });
        }

        const review = await Review.create({
            ...req.body,
            isVerifiedPurchase: true
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Admin
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) {
            await review.deleteOne();
            res.json({ message: 'Review removed' });
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getReviews, createReview, deleteReview };
