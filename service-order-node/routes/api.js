const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

const { requireAuth } = require('../middleware/auth');

// Consumer endpoint (memanggil UserService & ProductService)
// Gunakan requireAuth agar user_id diambil otomatis dari Bearer token
router.post('/orders', requireAuth, OrderController.create);

// Provider endpoints (disediakan untuk service lain)
router.get('/orders', requireAuth, OrderController.getAll);
router.get('/orders/:id', requireAuth, OrderController.getById);
router.get('/orders/user/:userId', requireAuth, OrderController.getByUserId);
router.put('/orders/:id/status', requireAuth, OrderController.updateStatus);

module.exports = router;
