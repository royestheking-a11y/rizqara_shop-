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
const { getVector, cosineSimilarity } = require('../services/visualSearchService');

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

        // AUTOMATION: AI SEO & VISUAL SEARCH
        let seoData = null;
        let imageVector = [];

        if (imageUrls.length > 0) {
            const mainImage = imageUrls[0];

            console.log("Generating Automations for:", mainImage);

            // Parallel execution for speed
            const [seoResult, vectorResult] = await Promise.all([
                generateSeoData(mainImage, title_en),
                getVector(mainImage)
            ]);

            seoData = seoResult;
            if (vectorResult) imageVector = vectorResult;
            console.log("Vector Generated Size:", imageVector.length);
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
            tags: seoData?.tags || [],
            imageVector, // Store the math vector!
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

// @desc    Search products by Image
// @route   POST /api/products/search-image
// @access  Public
const searchByImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        console.log("Visual Search Triggered:", req.file.path);

        // 1. Generate Vector for the query image
        // req.file.path is the Cloudinary URL (or local path if not using cloud for this)
        // Since we are using Cloudinary for upload route, it should be a URL.
        const queryVector = await getVector(req.file.path);

        if (!queryVector) {
            return res.status(500).json({ message: 'Failed to process image' });
        }

        // 2. Fetch all product vectors (Projection to minimize RAM usage)
        // Only fetch products that HAVE a vector
        const products = await Product.find({ imageVector: { $exists: true, $not: { $size: 0 } } })
            .select('_id title_en price images imageVector category');

        // 3. Calculate Similarity In-Memory
        // Note: For <5000 products, this is instant. For millions, use Atlas Vector Search.
        const results = products.map(p => {
            const similarity = cosineSimilarity(queryVector, p.imageVector);
            return {
                product: p,
                score: similarity
            };
        });

        // 4. Sort & Filter
        const topMatches = results
            .sort((a, b) => b.score - a.score) // Highest score first
            .filter(r => r.score > 0.5) // Minimum visual similarity threshold (50%)
            .slice(0, 10) // Top 10 matches
            .map(r => r.product); // Return just the products

        // Cleanup: We don't need to keep the query image if it was just for search
        // But since it's on Cloudinary, we might want to delete it or keep it as "search history".
        // For now, let's just return results.

        res.json(topMatches);

    } catch (error) {
        console.error("Visual Search Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchByImage
};
