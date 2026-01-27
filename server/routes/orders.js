const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders); // For admin, maybe middleware later
router.get('/myorders', getMyOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/price', async (req, res) => {
    const { updateOrderPrice } = require('../controllers/orderController');
    return updateOrderPrice(req, res);
});

module.exports = router;
