const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkOrphans = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        const orphans = await Order.find({
            $or: [{ userId: { $exists: false } }, { userId: null }, { userId: "undefined" }]
        });

        console.log(`Found ${orphans.length} orphaned orders.`);
        orphans.forEach(o => {
            console.log(`- Invoice: ${o.invoiceNo}, User: ${o.userName}, Phone: ${o.userPhone}, Date: ${o.date}`);
            // Check if there is a userId inside the item or other fields? Unlikely.
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOrphans();
