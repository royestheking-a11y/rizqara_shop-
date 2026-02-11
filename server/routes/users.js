const express = require('express');
const router = express.Router();
const { getUsers, toggleBanUser, updateUserProfile, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getUsers);
router.route('/profile').put(protect, updateUserProfile);
router.route('/:id/ban').put(protect, admin, toggleBanUser);
router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;
