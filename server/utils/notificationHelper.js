const Notification = require('../models/Notification');

/**
 * Create a new notification for a user
 */
const createNotification = async (userId, type, title_en, title_bn, body_en, body_bn, link = null) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title_en,
            title_bn,
            body_en,
            body_bn,
            link,
            read: false
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

module.exports = { createNotification };
