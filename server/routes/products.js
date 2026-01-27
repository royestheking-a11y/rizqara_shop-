const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.post('/', upload.array('images'), createProduct);
router.route('/:id').put(updateProduct).delete(deleteProduct);

module.exports = router;
