const PremiumReview = require('../models/PremiumReview');

// @desc    Get all premium reviews
// @route   GET /api/reviews/premium
// @access  Public
const getPremiumReviews = async (req, res) => {
    try {
        const reviews = await PremiumReview.find({}).sort({ date: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a premium review
// @route   POST /api/reviews/premium
// @access  Admin
const addPremiumReview = async (req, res) => {
    try {
        const { title, imageUrl } = req.body;
        const review = await PremiumReview.create({
            title,
            imageUrl
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a premium review
// @route   DELETE /api/reviews/premium/:id
// @access  Admin
const deletePremiumReview = async (req, res) => {
    try {
        const review = await PremiumReview.findById(req.params.id);
        if (review) {
            await review.deleteOne();
            res.json({ message: 'Premium review removed' });
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPremiumReviews, addPremiumReview, deletePremiumReview };
