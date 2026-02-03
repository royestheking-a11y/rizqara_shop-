const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Receive SMS from Android Forwarder App
// GET method for validation checks by the app
router.get('/sms', (req, res) => {
    res.status(200).send('SMS Webhook is active');
});

router.post('/sms', async (req, res) => {
    try {
        const { sender, message, token } = req.body;

        // 1. Token Verification
        // In a real app, use process.env.SMS_WEBHOOK_TOKEN
        if (token !== 'RizQara_Secure_789') {
            console.log('Unauthorized SMS Webhook attempt');
            return res.status(401).send('Unauthorized');
        }

        console.log(`Received SMS from ${sender}: ${message}`);

        // 2. Regex Parsing for TrxID and Amount
        // Supports: TrxID (bKash), TxnID (Nagad), TxnId (Rocket)
        const trxIdPattern = /(?:TrxID|TxnID|TxnId)[ :]+([A-Z0-9]+)/i;
        const amountPattern = /(?:Tk|BDT|taka)[ :]+([0-9,.]+)/i;

        const trxIdMatch = message.match(trxIdPattern);
        const amountMatch = message.match(amountPattern);

        if (trxIdMatch) {
            const receivedTrxID = trxIdMatch[1];
            const receivedAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

            console.log(`Extracted TrxID: ${receivedTrxID}, Amount: ${receivedAmount}`);

            // 3. Find Matching Order
            // Find order where user submitted this TrxID and status is pending
            const order = await Order.findOne({
                trxId: receivedTrxID,
                status: 'pending' // Only verify pending orders
            });

            if (order) {
                console.log(`Matching order found: ${order.invoiceNo}`);

                // Optional: Verify amount match if needed
                // if (order.total !== receivedAmount) { ... }

                // 4. Update Order Status
                order.paymentStatus = 'verified';
                order.status = 'processing'; // or 'confirmed'

                // Add to history
                order.trackingHistory.push({
                    status: 'processing',
                    date: new Date(),
                    note: `Payment verified via SMS Webhook. TrxID: ${receivedTrxID}`
                });

                await order.save();
                console.log(`Order ${order.invoiceNo} automatically verified via SMS.`);
            } else {
                console.log(`No pending order found for TrxID: ${receivedTrxID}`);
            }
        } else {
            console.log('Could not extract TrxID from message.');
        }

        res.status(200).send('Received');

    } catch (error) {
        console.error('SMS Webhook Error:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
