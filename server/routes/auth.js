const express = require('express');
const router = express.Router();
const { signup, login, updateProfile, googleLogin, facebookLogin } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.put('/profile', updateProfile);

module.exports = router;
