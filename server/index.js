const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv'); // Loaded
const connectDB = require('./config/db');

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
app.use('/api/webhooks', require('./routes/webhooks')); // SMS Webhook
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

server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
    console.log('Routes registered: /api/steadfast');
});
