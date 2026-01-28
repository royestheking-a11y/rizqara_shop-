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

        // Check for Auto-Reply (if sent to Admin)
        if (receiverId === 'admin_1') {
            // setTimeout Logic handled by returning a flag or handled in background?
            // Since we need to save the reply to DB, we can do it here.
            // But to avoid blocking the response delay, we can just save it immediately with a slight timestamp offset
            // OR we can just return the user message and letting client know.
            // Better UX: Save reply now but return both? Or just let the client poll/socket receive it.
            // Let's create the reply record asynchronously.

            setTimeout(async () => {
                try {
                    const reply = new Message({
                        senderId: 'admin_1',
                        receiverId: senderId,
                        text: 'Thank you for your message. We will get back to you shortly.',
                        type: 'support',
                        read: false,
                        timestamp: new Date()
                    });
                    await reply.save();
                    // Note: Ideally we would emit a socket event here too if we had access to IO instance.
                    // For now, reliance is on polling or client-side socket emission which might result in duplicates if not careful.
                    // But since we are moving towards DB persistence, the polling/fetching on load will catch it.
                } catch (err) {
                    console.error('Auto-reply error:', err);
                }
            }, 1000);
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

module.exports = {
    sendMessage,
    getMessages
};
