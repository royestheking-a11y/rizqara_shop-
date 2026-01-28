const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages
// @access  Public (or Private if auth middleware added later)
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text, image, metadata, type } = req.body;

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image,
            metadata,
            type: type || 'support',
            read: false,
            timestamp: new Date()
        });

        const savedMessage = await newMessage.save();

        // Real-time Socket Emission
        const io = req.app.get('io');
        if (io) {
            io.to(receiverId).emit('receive_message', savedMessage);

            // Also emit to sender for multi-device sync
            // io.to(senderId).emit('receive_message', savedMessage);
        }

        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages for a user
// @route   GET /api/messages/:userId
// @access  Public/Private
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        let messages;
        // If Admin, fetch ALL messages (sorted by timestamp)
        if (userId === 'admin_1' || userId === 'admin') {
            messages = await Message.find({}).sort({ timestamp: 1 });
        } else {
            // Find messages where user is sender OR receiver
            messages = await Message.find({
                $or: [{ senderId: userId }, { receiverId: userId }]
            }).sort({ timestamp: 1 });
        }

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndDelete(id);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a conversation thread
// @route   DELETE /api/messages/thread/:userId
// @access  Private (Admin)
const deleteThread = async (req, res) => {
    try {
        const { userId } = req.params;
        // Delete where user is sender OR receiver
        await Message.deleteMany({
            $or: [{ senderId: userId }, { receiverId: userId }]
        });
        res.json({ message: 'Conversation thread deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    deleteMessage,
    deleteThread
};
