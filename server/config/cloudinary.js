const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: `rizqara_shop/${req.body.folder || 'products'}`,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            format: 'webp', // Force convert to WebP
            transformation: [{ width: 1600, crop: "limit" }, { quality: "auto" }] // Resize & Optimize
        };
    },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
