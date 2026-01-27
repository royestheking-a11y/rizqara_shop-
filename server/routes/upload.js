const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { upload } = require('../config/cloudinary');

router.post('/', upload.single('file'), uploadFile);

module.exports = router;
