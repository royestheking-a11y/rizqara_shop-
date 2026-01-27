const express = require('express');
const router = express.Router();
const { getSlides, createSlide, updateSlide, deleteSlide } = require('../controllers/carouselController');

router.route('/').get(getSlides).post(createSlide);
router.route('/:id').put(updateSlide).delete(deleteSlide);

module.exports = router;
