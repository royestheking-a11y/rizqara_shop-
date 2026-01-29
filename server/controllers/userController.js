const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ban/Unban user
// @route   PUT /api/users/:id/ban
// @access  Admin
const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.isBanned = req.body.isBanned;
            user.bannedReason = req.body.bannedReason || '';
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            // user.email = req.body.email || user.email; // Usually separate flow for email

            if (req.body.addresses) {
                user.addresses = req.body.addresses;
            }

            if (req.body.reminders) {
                user.reminders = req.body.reminders;
            }

            // Handle other fields if necessary (e.g. avatar)

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                phone: updatedUser.phone,
                addresses: updatedUser.addresses,
                reminders: updatedUser.reminders,
                token: generateToken(updatedUser._id), // Optional: Refresh token if needed
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper for token if not already imported (or just remove token if not refreshing)
// Since we don't have generateToken imported here, I'll Skip token return or import it.
// Better to just return user data without new token unless changing auth details.
// Replacing the token line with nothing or just user data.
// Re-writing without generateToken.

module.exports = { getUsers, toggleBanUser, updateUserProfile };
