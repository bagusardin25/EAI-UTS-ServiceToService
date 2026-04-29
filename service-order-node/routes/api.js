const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { requireAuth } = require('../middleware/auth');

// Consumer endpoint (memanggil UserService & ProductService)
// Gunakan requireAuth agar user_id diambil otomatis dari Bearer token
router.post('/orders', requireAuth, OrderController.create);

// Provider endpoints (disediakan untuk service lain)
// PENTING: Route spesifik harus di atas route dengan parameter (:id)
// agar Express tidak mencocokkan "all" atau "user" sebagai :id
router.get('/orders/all', requireAuth, OrderController.getAllAdmin);
router.get('/orders/user/:userId', requireAuth, OrderController.getByUserId);
router.get('/orders', requireAuth, OrderController.getAll);
router.get('/orders/:id', requireAuth, OrderController.getById);
router.put('/orders/:id/status', requireAuth, OrderController.updateStatus);
router.patch('/orders/:id/cancel', requireAuth, OrderController.cancelOrder);

module.exports = router;
