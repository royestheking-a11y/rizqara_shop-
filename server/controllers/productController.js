const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { generateSeoData } = require('../services/seoService');

// ...

// @desc    Create a product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
    try {
        const { title_en, price, category, ...rest } = req.body;

        let imageUrls = [];

        // Handle existing images (passed as strings)
        if (req.body.images) {
            if (Array.isArray(req.body.images)) {
                imageUrls = [...req.body.images];
            } else {
                imageUrls.push(req.body.images);
            }
        }

        // Handle new file uploads
        if (req.files) {
            const newFiles = req.files.map(file => file.path);
            imageUrls = [...imageUrls, ...newFiles];
        }

        // AI SEO AUTOMATION
        let seoData = null;
        if (imageUrls.length > 0) {
            console.log("Generating AI SEO Data...");
            // Use the first image for analysis
            seoData = await generateSeoData(imageUrls[0], title_en);
        }

        const product = new Product({
            id: `prod_${Date.now()}`, // Generate ID
            title_en,
            price,
            category,
            images: imageUrls,
            fakeSales: Math.floor(Math.random() * (200 - 60 + 1)) + 60, // Random 60-200
            rating: 5,
            reviews: 5, // Initial fake review count
            seo: seoData ? {
                altText: seoData.altText,
                metaDescription: seoData.metaDescription,
                generatedAt: new Date()
            } : undefined,
            tags: seoData?.tags || [], // Helper to auto-tag if schema supports it
            ...rest
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id }) || await Product.findById(req.params.id);

        if (product) {
            Object.assign(product, req.body);
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
// Helper to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
    try {
        if (!url || !url.includes('/upload/')) return null;
        const splitUrl = url.split('/upload/');
        let publicId = splitUrl[1];
        // Remove version (v12345/)
        publicId = publicId.replace(/^v\d+\//, '');
        // Remove extension
        if (publicId.lastIndexOf('.') !== -1) {
            publicId = publicId.substring(0, publicId.lastIndexOf('.'));
        }
        return publicId;
    } catch (error) {
        console.error('Error parsing public ID:', error);
        return null;
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
    try {
        // Try finding by custom 'id' first, then by _id
        const product = await Product.findOne({ id: req.params.id }) || await Product.findById(req.params.id);

        if (product) {
            // Delete images from Cloudinary
            if (product.images && product.images.length > 0) {
                const deletePromises = product.images.map(url => {
                    const publicId = getPublicIdFromUrl(url);
                    if (publicId) {
                        return cloudinary.uploader.destroy(publicId);
                    }
                    return Promise.resolve();
                });
                await Promise.all(deletePromises);
            }

            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
