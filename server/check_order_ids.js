const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkOrderIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const orders = await Order.find({}, 'id invoiceNo');

        const ids = orders.map(o => o.id);
        const uniqueIds = new Set(ids);

        if (ids.length !== uniqueIds.size) {
            console.log('Duplicate IDs found!');
            // Find duplicates
            const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
            console.log('Duplicate IDs:', duplicates);
        } else {
            console.log('All Order IDs are unique.');
        }

        const missingIds = orders.filter(o => !o.id);
        if (missingIds.length > 0) {
            console.log(`Found ${missingIds.length} orders with missing 'id'.`);
            missingIds.forEach(o => console.log(`- Invoice: ${o.invoiceNo}`));
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkOrderIds();
