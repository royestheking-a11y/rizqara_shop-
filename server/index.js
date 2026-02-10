const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv'); // Loaded
const connectDB = require('./config/db');
const axios = require('axios'); // For self-ping mechanism

const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Body parser with higher limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
console.log('Registering routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('Registered: /api/auth');
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/carousels', require('./routes/carousels'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/vouchers', require('./routes/vouchers'));
app.use('/api/steadfast', require('./routes/steadfast'));
app.use('/api/users', require('./routes/users'));
app.use('/api/push', require('./routes/push'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/webhooks', require('./routes/webhooks')); // Payment webhooks
app.use('/api/sms-webhook', require('./routes/smsWebhook')); // SMS Forwarder
app.use('/api/utils', require('./routes/utils')); // Temporary migration endpoint
console.log('All routes registered.');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Share io instance with controllers
app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} joined room ${userId}`);
    });

    socket.on('send_message', (data) => {
        socket.to(data.receiverId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
console.log(`Attempting to start server on port ${PORT}...`);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);

    console.log('Routes registered: /api/steadfast');

    // Keep-Alive Mechanism (Self-Ping)
    // Pings the server every 14 minutes to prevent Render from sleeping (sleeps after 15 mins of inactivity)
    const KEEPALIVE_URL = 'https://rizqara-shop-backend.onrender.com/health';
    const KEEPALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes

    const keepAlive = async () => {
        try {
            console.log(`[KeepAlive] Pinging ${KEEPALIVE_URL}...`);
            const response = await axios.get(KEEPALIVE_URL);
            console.log(`[KeepAlive] Ping successful: ${response.status}`);
        } catch (error) {
            console.error(`[KeepAlive] Ping failed: ${error.message}`);
        }
    };

    // Only run self-ping if we are in production (or if the URL matches the production one)
    // We can just run it always if the URL is hardcoded, but better to check if we are on the actual server to avoid local spamming
    // For now, I'll just run it. The error log will show if it fails locally (which is fine).
    if (process.env.NODE_ENV === 'production' || KEEPALIVE_URL.includes('onrender.com')) {
        // Initial ping after 1 minute to allow server to stabilize
        setTimeout(keepAlive, 60000);

        // Regular pings
        setInterval(keepAlive, KEEPALIVE_INTERVAL);
    }
});
