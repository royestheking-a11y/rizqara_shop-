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
console.log('All routes registered.');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} joined room ${userId}`);
    });

    socket.on('send_message', (data) => {
        // ... (Keep existing socket logic for now)
        socket.to(data.receiverId).emit('receive_message', data);

        // Simulating Admin Auto-Reply
        if (data.receiverId === 'admin_1') {
            setTimeout(() => {
                const reply = {
                    id: Date.now().toString(),
                    senderId: 'admin_1',
                    receiverId: data.senderId,
                    text: 'Thank you for your message. We will get back to you shortly.',
                    timestamp: new Date().toISOString(),
                    type: 'support',
                    read: false
                };
                io.to(data.senderId).emit('receive_message', reply);
            }, 1000);
        }
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
