const express = require('express');
const router = express.Router();
const axios = require('axios');

// Environment variables should be in process.env from server/.env
// STEADFAST_API_KEY
// STEADFAST_SECRET_KEY

const BASE_URL = 'https://portal.packzy.com/api/v1'; // Trying packzy fallback

router.post('/create_order', async (req, res) => {
    try {
        console.log('Steadfast: Received order creation request', req.body);
        const { invoice, recipient_name, recipient_phone, recipient_address, cod_amount, note } = req.body;

        const apiKey = process.env.STEADFAST_API_KEY;
        const secretKey = process.env.STEADFAST_SECRET_KEY;

        console.log('Steadfast: Tokens present?', { hasKey: !!apiKey, hasSecret: !!secretKey });

        if (!apiKey || !secretKey) {
            return res.status(500).json({ message: 'Steadfast API keys not configured' });
        }

        const payload = {
            invoice,
            recipient_name,
            recipient_phone,
            recipient_address,
            cod_amount: Number(cod_amount), // Ensure number
            note: note || 'Premium Order'
        };

        const response = await axios.post(`${BASE_URL}/create_order`, payload, {
            headers: {
                'Api-Key': apiKey,
                'Secret-Key': secretKey,
                'Content-Type': 'application/json'
            }
        });

        console.log('Steadfast API Success:', response.data);
        res.json(response.data);

    } catch (error) {
        console.error('Steadfast API Error Detail:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }

        res.status(500).json({
            message: 'Failed to create order with Steadfast',
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;
