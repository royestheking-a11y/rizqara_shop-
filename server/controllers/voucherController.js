const Voucher = require('../models/Voucher');

// @desc    Get all vouchers
// @route   GET /api/vouchers
// @access  Public (should optionally filter active) / Admin
const getVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find({});
        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a voucher
// @route   POST /api/vouchers
// @access  Admin
const createVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.create(req.body);
        res.status(201).json(voucher);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a voucher
// @route   PUT /api/vouchers/:id
// @access  Admin
const updateVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (voucher) {
            Object.assign(voucher, req.body);
            const updatedVoucher = await voucher.save();
            res.json(updatedVoucher);
        } else {
            res.status(404).json({ message: 'Voucher not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a voucher
// @route   DELETE /api/vouchers/:id
// @access  Admin
const deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (voucher) {
            await voucher.deleteOne();
            res.json({ message: 'Voucher removed' });
        } else {
            res.status(404).json({ message: 'Voucher not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVouchers, createVoucher, updateVoucher, deleteVoucher };
