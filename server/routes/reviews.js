const express = require('express');
const router = express.Router();
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { getPremiumReviews, addPremiumReview, deletePremiumReview } = require('../controllers/premiumReviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getReviews).post(protect, createReview);
router.route('/premium').get(getPremiumReviews).post(protect, admin, addPremiumReview);
router.route('/premium/:id').delete(protect, admin, deletePremiumReview);
router.route('/:id').delete(protect, admin, deleteReview);

module.exports = router;
