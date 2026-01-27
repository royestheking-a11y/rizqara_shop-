const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const fixOrphans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        // Target User by Email
        const targetEmail = 'parizaadsani@gmail.com';
        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.log(`User with email ${targetEmail} not found.`);
            process.exit();
        }

        console.log(`Found User: ${user.name} (${user.id})`);

        // Target orders by phone used in checkout
        const targetPhone = '01604710170';

        const result = await Order.updateMany(
            { $or: [{ userId: { $exists: false } }, { userId: null }, { userId: "undefined" }], userPhone: targetPhone },
            { $set: { userId: user.id, user: user._id } }
        );

        console.log(`Updated ${result.modifiedCount} orders.`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixOrphans();
