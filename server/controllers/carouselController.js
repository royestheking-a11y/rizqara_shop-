const Carousel = require('../models/Carousel');

// @desc    Get all slides
// @route   GET /api/carousels
// @access  Public
const getSlides = async (req, res) => {
    try {
        const slides = await Carousel.find({}).sort({ order: 1 });
        res.json(slides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a slide
// @route   POST /api/carousels
// @access  Admin
const createSlide = async (req, res) => {
    try {
        const slide = await Carousel.create(req.body);
        res.status(201).json(slide);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a slide
// @route   PUT /api/carousels/:id
// @access  Admin
const updateSlide = async (req, res) => {
    try {
        const slide = await Carousel.findById(req.params.id);
        if (slide) {
            Object.assign(slide, req.body);
            const updatedSlide = await slide.save();
            res.json(updatedSlide);
        } else {
            res.status(404).json({ message: 'Slide not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a slide
// @route   DELETE /api/carousels/:id
// @access  Admin
const { cloudinary } = require('../config/cloudinary');

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

// @desc    Delete a slide
// @route   DELETE /api/carousels/:id
// @access  Admin
const deleteSlide = async (req, res) => {
    try {
        const slide = await Carousel.findById(req.params.id);
        if (slide) {
            // Delete image from Cloudinary
            if (slide.image) {
                const publicId = getPublicIdFromUrl(slide.image);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            await slide.deleteOne();
            res.json({ message: 'Slide removed' });
        } else {
            res.status(404).json({ message: 'Slide not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSlides, createSlide, updateSlide, deleteSlide };
