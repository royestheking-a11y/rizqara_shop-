const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct, searchByImage } = require('../controllers/productController');
const { upload } = require('../config/cloudinary');

router.route('/').get(getProducts).post(upload.array('images'), createProduct);
router.post('/search-image', upload.single('image'), searchByImage); // New Visual Search Route
router.route('/:id').put(upload.array('images'), updateProduct).delete(deleteProduct);

module.exports = router;
