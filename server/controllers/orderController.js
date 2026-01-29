const Order = require('../models/Order');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const {
            items,
            total,
            subtotal,
            deliveryFee,
            shippingAddress,
            paymentMethod,
            userName,
            userPhone,
            userId
        } = req.body;

        // Generate Invoice No
        const invoiceNo = `INV-${Date.now()}`;

        const order = new Order({
            invoiceNo,
            userId, // Ensure this matches what frontend sends
            userName,
            userPhone,
            items,
            total,
            subtotal,
            deliveryFee,
            shippingAddress,
            paymentMethod,
            trackingHistory: [{ status: 'pending', date: new Date(), note: 'Order placed' }]
        });

        const createdOrder = await order.save();

        // Update Real Sales Count for Products
        for (const item of items) {
            // Find by custom 'id' (string) or _id if needed. Try custom id first matching schema.
            // But schema uses `id: String`.
            const product = await require('../models/Product').findOne({ id: item.id });
            if (product) {
                product.realSales = (product.realSales || 0) + item.quantity;
                await product.save();
            }
        }

        // TODO: Trigger Email here if server-side email sending is desired?
        // For now, frontend handles it via EmailJS as per previous tasks.

        // Create notification for user
        await createNotification(
            userId,
            'order',
            `Order Placed #${invoiceNo}`,
            `অর্ডার সফল #${invoiceNo}`,
            `Your order has been placed successfully. Total: ৳${total}`,
            `আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে। মোট: ৳${total}`,
            `/account/orders`
        );

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const userId = req.query.userId; // Or from auth middleware
        const orders = await Order.find({ userId }).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status, trackingCode } = req.body;
        const order = await Order.findOne({ id: req.params.id }) || await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            order.trackingHistory.push({
                status,
                date: new Date(),
                note: trackingCode ? `Tracking: ${trackingCode}` : undefined
            });

            if (trackingCode) {
                order.trackingCode = trackingCode;
            }

            // Payment automation
            if (status === 'delivered' && order.paymentMethod === 'cod') {
                order.paymentStatus = 'verified';
                order.trackingHistory.push({ status: 'verified', date: new Date(), note: 'Payment collected via COD' });
            }

            const updatedOrder = await order.save();

            // Create notification for user based on status
            const statusMessages = {
                confirmed: {
                    title_en: `Order Confirmed #${order.invoiceNo}`,
                    title_bn: `অর্ডার নিশ্চিত #${order.invoiceNo}`,
                    body_en: 'Your order has been confirmed and will be shipped soon.',
                    body_bn: 'আপনার অর্ডার নিশ্চিত করা হয়েছে এবং শীঘ্রই পাঠানো হবে।'
                },
                shipped: {
                    title_en: `Order Shipped #${order.invoiceNo}`,
                    title_bn: `অর্ডার পাঠানো হয়েছে #${order.invoiceNo}`,
                    body_en: 'Your order is on its way!',
                    body_bn: 'আপনার অর্ডার পথে আছে!'
                },
                delivered: {
                    title_en: `Order Delivered #${order.invoiceNo}`,
                    title_bn: `অর্ডার ডেলিভার হয়েছে #${order.invoiceNo}`,
                    body_en: 'Your order has been delivered. Thank you!',
                    body_bn: 'আপনার অর্ডার ডেলিভার করা হয়েছে। ধন্যবাদ!'
                }
            };

            if (statusMessages[status]) {
                await createNotification(
                    order.userId,
                    'delivery',
                    statusMessages[status].title_en,
                    statusMessages[status].title_bn,
                    statusMessages[status].body_en,
                    statusMessages[status].body_bn,
                    '/account/orders'
                );
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order price (manual pricing for custom items)
// @route   PUT /api/orders/:id/price
// @access  Private/Admin
const updateOrderPrice = async (req, res) => {
    try {
        const { total } = req.body;
        const order = await Order.findOne({ id: req.params.id }) || await Order.findById(req.params.id);

        if (order) {
            order.total = total;
            // Also update subtotal for consistency if it's the same
            order.subtotal = total - (order.deliveryFee || 0);

            order.trackingHistory.push({
                status: order.status,
                date: new Date(),
                note: `Price manually set to ৳${total}`
            });

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ id: req.params.id }) || await Order.findById(req.params.id);

        if (order) {
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrders,
    updateOrderStatus,
    updateOrderPrice,
    deleteOrder
};
