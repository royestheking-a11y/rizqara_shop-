const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
    image: String,
    metadata: {
        orderId: String, // Optional link to an order
        type: { type: String, enum: ['support', 'order', 'custom'], default: 'support' }
    },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
