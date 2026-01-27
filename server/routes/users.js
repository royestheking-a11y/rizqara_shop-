const express = require('express');
const router = express.Router();
const { getUsers, toggleBanUser } = require('../controllers/userController');

router.route('/').get(getUsers);
router.route('/:id/ban').put(toggleBanUser);

module.exports = router;
