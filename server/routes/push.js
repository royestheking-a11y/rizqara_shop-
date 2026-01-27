const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const User = require('../models/User');

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
    'mailto:admin@rizqara.com',
    publicVapidKey,
    privateVapidKey
);

// Get Public Key
router.get('/key', (req, res) => {
    res.json({ publicKey: publicVapidKey });
});

// Subscribe a user
router.post('/subscribe', async (req, res) => {
    const { userId, subscription } = req.body;

    try {
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                // Check if subscription already exists to avoid duplicates
                const exists = user.pushSubscriptions.some(
                    s => s.endpoint === subscription.endpoint
                );
                if (!exists) {
                    user.pushSubscriptions.push(subscription);
                    await user.save();
                }
            }
        }
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Push Subscription Error:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Send notification (Test or Internal use)
router.post('/send', async (req, res) => {
    const { userId, title, body, icon, url } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || !user.pushSubscriptions.length) {
            return res.status(404).json({ error: 'User not found or not subscribed' });
        }

        const payload = JSON.stringify({
            title: title || 'RizQara Shop',
            body: body || 'You have a new update!',
            icon: icon || '/pwa-icon-192.png',
            data: { url: url || '/' }
        });

        const sendPromises = user.pushSubscriptions.map(subscription =>
            webpush.sendNotification(subscription, payload).catch(err => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription expired or invalid, remove it
                    return 'remove';
                }
                console.error('Push Send Error for one device:', err);
                return null;
            })
        );

        const results = await Promise.all(sendPromises);

        // Clean up invalid subscriptions
        if (results.includes('remove')) {
            user.pushSubscriptions = user.pushSubscriptions.filter((_, i) => results[i] !== 'remove');
            await user.save();
        }

        res.json({ message: 'Notification sent' });
    } catch (error) {
        console.error('Push overall error:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

module.exports = router;
