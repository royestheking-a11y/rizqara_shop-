const User = require('../models/User');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Simple ID generation to match frontend style or let Mongo do it.
        // Frontend used `u_${Date.now()}`. Let's keep using Mongo _id but maybe store the "id" field if needed?
        // The schema has `id` field.
        const id = `u_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const user = await User.create({
            id,
            name,
            email,
            password, // Plain text for now as per migration simplicity, ideally hash
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: 'dummy_token_for_now' // Implement JWT later or now?
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        console.log('Login attempt:', email);
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
            console.log('Password match:', user.password === password);
        }

        if (user && user.password === password) {
            res.json({
                _id: user._id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                cart: [], // Add cart logic if needed
                addresses: user.addresses,
                token: 'dummy_token_for_now'
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }); // Or use ID from middleware

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            if (req.body.password) {
                user.password = req.body.password;
            }
            // Addresses update might be complex, simplified here
            if (req.body.addresses) {
                user.addresses = req.body.addresses;
            }
            if (req.body.profileImage) {
                user.profileImage = req.body.profileImage;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                addresses: updatedUser.addresses,
                token: 'dummy_token_for_now'
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        const { email, name, picture } = googleResponse.data;

        let user = await User.findOne({ email });

        // Auto-upload profile picture to Cloudinary if it's a Google URL
        let profileImageUrl = picture;
        if (picture && picture.includes('googleusercontent.com')) {
            try {
                const uploadRes = await cloudinary.uploader.upload(picture, {
                    folder: 'profile_images',
                    resource_type: 'image'
                });
                profileImageUrl = uploadRes.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error for Google profile photo:', uploadError);
            }
        }

        if (!user) {
            const id = `u_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            user = await User.create({
                id,
                name,
                email,
                password: `google_${Date.now()}_${Math.random().toString(36).substring(7)}`, // satisfy model validation
                profileImage: profileImageUrl,
                role: 'customer'
            });
        } else if (profileImageUrl && profileImageUrl !== user.profileImage) {
            // Update profile image if changed
            user.profileImage = profileImageUrl;
            await user.save();
        }

        res.json({
            _id: user._id,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            addresses: user.addresses,
            token: 'dummy_token_for_google'
        });
    } catch (error) {
        console.error('Google Auth Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Google login failed' });
    }
};

module.exports = {
    signup,
    login,
    updateProfile,
    googleLogin
};
