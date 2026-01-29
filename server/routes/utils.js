const express = require('express');
const router = express.Router();
const User = require('../models/User');

// TEMPORARY: Reset reminders to fix schema cache issue
router.post('/fix-reminders/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Find user and completely unset reminders, then set to empty array
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Force update using $unset then $set to clear schema cache
        await User.updateOne(
            { email },
            { $unset: { reminders: "" } }
        );

        await User.updateOne(
            { email },
            { $set: { reminders: [] } }
        );

        res.json({ message: 'Reminders field reset successfully', email });
    } catch (error) {
        console.error('Fix reminders error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
