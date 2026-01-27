const express = require('express');
const router = express.Router();
const { signup, login, updateProfile, googleLogin } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.put('/profile', updateProfile);

module.exports = router;
