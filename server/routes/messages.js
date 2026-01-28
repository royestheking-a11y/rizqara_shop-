const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, deleteMessage, deleteThread, markAsRead } = require('../controllers/messageController');

router.post('/', sendMessage);
router.get('/:userId', getMessages);

router.delete('/:id', deleteMessage);
router.delete('/thread/:userId', deleteThread);
router.put('/read/:senderId', markAsRead);

module.exports = router;
