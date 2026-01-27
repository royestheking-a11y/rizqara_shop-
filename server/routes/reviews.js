const express = require('express');
const router = express.Router();
const { getReviews, createReview, deleteReview } = require('../controllers/reviewController');

router.route('/').get(getReviews).post(createReview);
router.route('/:id').delete(deleteReview);

module.exports = router;
