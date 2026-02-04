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

        // ========================================
        // 🔥 PAYMENT CONFIRMATION HANDLERS
        // ========================================

        // 1️⃣ bKash Payment Detection
        if (from?.toLowerCase().includes('bkash') || text?.toLowerCase().includes('trxid')) {
            await handleBkashPayment(text);
        }

        // 2️⃣ Nagad Payment Detection
        if (from?.toLowerCase().includes('nagad') || text?.match(/nagad|txn\s*id|transaction\s*id/i)) {
            await handleNagadPayment(text);
        }

        // 3️⃣ Rocket Payment Detection
        if (from?.toLowerCase().includes('rocket') || from?.includes('16216') || text?.toLowerCase().includes('rocket')) {
            await handleRocketPayment(text);
        }

        // ========================================
        // 📦 DELIVERY CONFIRMATION HANDLERS
        // ========================================

        // Steadfast Delivery
        if (from?.includes('Steadfast') || text?.includes('delivered')) {
            const trackingMatch = text.match(/tracking.*?(\w+)/i);
            if (trackingMatch) {
                const trackingId = trackingMatch[1];

                const order = await Order.findOne({ 'shipping.trackingNumber': trackingId });
                if (order) {
                    order.status = 'delivered';
                    order.deliveredAt = new Date();
                    await order.save();
                    console.log(`✅ Order ${order.invoiceNo} marked as delivered via SMS`);
                }
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

// ========================================
// 💰 PAYMENT PARSING FUNCTIONS
// ========================================

/**
 * Parse bKash Payment SMS
 * Example: "You have received Tk 70.00 from 01577180519. Fee Tk 0.00. Balance Tk 70.00. TrxID DB47RWOBOT"
 */
async function handleBkashPayment(text) {
    try {
        // Extract Transaction ID
        const trxMatch = text.match(/TrxID[:\s]+(\w+)/i) || text.match(/Transaction\s*ID[:\s]+(\w+)/i);

        // Extract Amount (handles formats: Tk 1,250 or Tk70.00)
        const amountMatch = text.match(/(?:Tk|BDT)[:\s]*([\d,]+(?:\.\d{2})?)/i);

        // Extract Sender Number
        const senderMatch = text.match(/(?:from|sender)[:\s]*(01\d{9})/i);

        if (!trxMatch || !amountMatch) {
            console.log('⚠️ bKash SMS missing required fields');
            return;
        }

        const transactionId = trxMatch[1];
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const senderNumber = senderMatch?.[1];

        console.log(`
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        💰 bKash PAYMENT DETECTED
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        Transaction ID: ${transactionId}
        Amount: ৳${amount}
        From: ${senderNumber || 'Unknown'}
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);

        // Find matching pending ORDER (not Payment collection)
        // Match by total amount and payment method
        const order = await Order.findOne({
            paymentMethod: /bkash/i, // Case insensitive
            paymentStatus: 'pending',
            total: amount
        }).sort({ date: -1 }); // Get most recent matching order

        if (order) {
            // Update order payment details
            order.paymentStatus = 'verified';
            order.trxId = transactionId;
            order.status = 'processing'; // Move from pending to processing

            // Add to tracking history
            if (!order.trackingHistory) order.trackingHistory = [];
            order.trackingHistory.push({
                status: 'verified',
                date: new Date(),
                note: `Payment verified via SMS - TrxID: ${transactionId}`
            });

            await order.save();

            console.log(`✅ Order ${order.invoiceNo} payment VERIFIED automatically!`);
            console.log(`   TrxID: ${transactionId} | Amount: ৳${amount} | From: ${senderNumber || 'N/A'}`);
        } else {
            console.log('⚠️ No matching pending bKash order found');
            console.log(`   Searched for: amount=${amount}, method=bkash, status=pending`);
        }

    } catch (error) {
        console.error('❌ bKash parsing error:', error);
    }
}

/**
 * Parse Nagad Payment SMS
 * Example: "Tk 2,100.00 received from 01812345678. Txn ID: NAG456GHI"
 */
async function handleNagadPayment(text) {
    try {
        // Extract Transaction ID (Nagad uses "Txn ID" or "Transaction ID")
        const trxMatch = text.match(/(?:Txn|Transaction)\s*ID[:\s]+(\w+)/i);

        // Extract Amount
        const amountMatch = text.match(/(?:Tk|BDT)[:\s]*([\d,]+(?:\.\d{2})?)/i);

        // Extract Sender Number
        const senderMatch = text.match(/(?:from|sender)[:\s]*(01\d{9})/i);

        if (!trxMatch || !amountMatch) {
            console.log('⚠️ Nagad SMS missing required fields');
            return;
        }

        const transactionId = trxMatch[1];
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const senderNumber = senderMatch?.[1];

        console.log(`
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        💰 NAGAD PAYMENT DETECTED
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        Transaction ID: ${transactionId}
        Amount: ৳${amount}
        From: ${senderNumber || 'Unknown'}
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);

        // Find matching pending order
        const order = await Order.findOne({
            paymentMethod: /nagad/i,
            paymentStatus: 'pending',
            total: amount
        }).sort({ date: -1 });

        if (order) {
            order.paymentStatus = 'verified';
            order.trxId = transactionId;
            order.status = 'processing';

            if (!order.trackingHistory) order.trackingHistory = [];
            order.trackingHistory.push({
                status: 'verified',
                date: new Date(),
                note: `Payment verified via SMS - TxnID: ${transactionId}`
            });

            await order.save();
            console.log(`✅ Order ${order.invoiceNo} payment VERIFIED automatically!`);
        } else {
            console.log('⚠️ No matching pending Nagad order found');
        }

    } catch (error) {
        console.error('❌ Nagad parsing error:', error);
    }
}

/**
 * Parse Rocket Payment SMS
 * Example: "Tk 1,750 received from 01612345678-7. Ref: RKT789MNO"
 */
async function handleRocketPayment(text) {
    try {
        // Extract Reference/Transaction ID
        const trxMatch = text.match(/(?:Ref|Reference|Transaction)[:\s]+(\w+)/i);

        // Extract Amount
        const amountMatch = text.match(/(?:Tk|BDT)[:\s]*([\d,]+(?:\.\d{2})?)/i);

        // Extract Sender Number (Rocket uses format like 01712345678-7)
        const senderMatch = text.match(/(?:from|sender)[:\s]*(01\d{9}(?:-\d)?)/i);

        if (!trxMatch || !amountMatch) {
            console.log('⚠️ Rocket SMS missing required fields');
            return;
        }

        const transactionId = trxMatch[1];
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        const senderNumber = senderMatch?.[1];

        console.log(`
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        💰 ROCKET PAYMENT DETECTED
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        Transaction ID: ${transactionId}
        Amount: ৳${amount}
        From: ${senderNumber || 'Unknown'}
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);

        // Find matching pending order
        const order = await Order.findOne({
            paymentMethod: /rocket/i,
            paymentStatus: 'pending',
            total: amount
        }).sort({ date: -1 });

        if (order) {
            order.paymentStatus = 'verified';
            order.trxId = transactionId;
            order.status = 'processing';

            if (!order.trackingHistory) order.trackingHistory = [];
            order.trackingHistory.push({
                status: 'verified',
                date: new Date(),
                note: `Payment verified via SMS - Ref: ${transactionId}`
            });

            await order.save();
            console.log(`✅ Order ${order.invoiceNo} payment VERIFIED automatically!`);
        } else {
            console.log('⚠️ No matching pending Rocket order found');
        }

    } catch (error) {
        console.error('❌ Rocket parsing error:', error);
    }
}

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'SMS Webhook is running',
        timestamp: new Date().toISOString(),
        supported: ['bKash', 'Nagad', 'Rocket', 'Steadfast']
    });
});

module.exports = router;
