const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// @desc    Receive SMS forwarded from Android app
// @route   POST /api/sms-webhook
// @access  Public (but should validate with a secret token)
router.post('/', async (req, res) => {
    try {
        console.log('📱 SMS Webhook Received:', req.body);

        const { from, text, sentStamp, receivedStamp, sim } = req.body;

        // Log to database for tracking
        console.log(`
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        📨 NEW SMS RECEIVED
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        From: ${from}
        Message: ${text}
        Received At: ${new Date(receivedStamp).toLocaleString()}
        SIM: ${sim}
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);

        // Example: Parse Steadfast delivery confirmation
        if (from?.includes('Steadfast') || text?.includes('delivered')) {
            const trackingMatch = text.match(/tracking.*?(\w+)/i);
            if (trackingMatch) {
                const trackingId = trackingMatch[1];

                // Update order status
                const order = await Order.findOne({ 'shipping.trackingNumber': trackingId });
                if (order) {
                    order.status = 'delivered';
                    order.deliveredAt = new Date();
                    await order.save();
                    console.log(`✅ Order ${order.id} marked as delivered via SMS`);
                }
            }
        }

        // Example: Parse bKash payment confirmation
        if (from?.includes('bKash') || text?.includes('TrxID')) {
            const trxMatch = text.match(/TrxID[:\s]+(\w+)/i);
            const amountMatch = text.match(/Tk[:\s]+([\d,]+)/i);

            if (trxMatch) {
                console.log(`💰 Payment Received: TrxID ${trxMatch[1]}, Amount: ${amountMatch?.[1] || 'N/A'}`);
                // You can update payment status here
            }
        }

        // Respond with success
        res.status(200).json({
            success: true,
            message: 'SMS received and processed',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ SMS Webhook Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'SMS Webhook is running', timestamp: new Date().toISOString() });
});

module.exports = router;
