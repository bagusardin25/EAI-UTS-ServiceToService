const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

// Consumer endpoint (memanggil UserService & ProductService)
router.post('/orders', OrderController.create);

// Provider endpoints (disediakan untuk service lain)
router.get('/orders', OrderController.getAll);
router.get('/orders/:id', OrderController.getById);
router.get('/orders/user/:userId', OrderController.getByUserId);
router.put('/orders/:id/status', OrderController.updateStatus);

module.exports = router;
