const axios = require('axios');
const db = require('../config/database');
const { Order, OrderItem } = require('../models');

const USER_SERVICE = process.env.USER_SERVICE_URL;
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL;

// Helper: generate order number (ORD-YYYYMMDD-XXXXX)
function generateOrderNumber() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    return `ORD-${date}-${random}`;
}

// [CONSUMER] - Membuat order baru, memanggil UserService & ProductService
exports.create = async (req, res) => {
    const t = await db.transaction();
    try {
        const { user_id, items, shipping_address, notes } = req.body;

        // Validasi input dasar
        if (!user_id || !items || !items.length) {
            return res.status(400).json({ message: 'user_id dan items wajib diisi' });
        }

        // Consumer: Ambil data user dari UserService
        const userRes = await axios.get(`${USER_SERVICE}/api/users/${user_id}`);
        const userData = userRes.data.data;

        // Consumer: Ambil data produk untuk setiap item dari ProductService
        let total_amount = 0;
        const orderItems = [];

        for (const item of items) {
            const prodRes = await axios.get(`${PRODUCT_SERVICE}/api/products/${item.product_id}`);
            const prod = prodRes.data.data;
            const subtotal = prod.price * item.quantity;
            total_amount += subtotal;

            orderItems.push({
                product_id: prod.id,
                product_name: prod.name,
                product_sku: prod.sku,
                unit_price: prod.price,
                quantity: item.quantity,
                subtotal,
            });
        }

        // Simpan order header
        const order = await Order.create({
            order_number: generateOrderNumber(),
            user_id,
            user_name: userData.name,
            user_email: userData.email,
            shipping_address,
            status: 'pending',
            total_amount,
            notes,
        }, { transaction: t });

        // Simpan order items
        for (const oi of orderItems) {
            await OrderItem.create({ ...oi, order_id: order.id }, { transaction: t });
        }

        await t.commit();

        // Fetch kembali dengan items
        const result = await Order.findByPk(order.id, { include: 'items' });
        res.status(201).json({ message: 'Order berhasil dibuat', data: result });

    } catch (error) {
        await t.rollback();
        // Handle error dari service lain
        if (error.response) {
            return res.status(error.response.status).json({
                message: `Gagal mengambil data dari service lain: ${error.response.data.message || error.message}`,
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// [PROVIDER] - Ambil semua order
exports.getAll = async (req, res) => {
    try {
        const orders = await Order.findAll({ include: 'items', order: [['created_at', 'DESC']] });
        res.status(200).json({ message: 'Berhasil mengambil semua order', data: orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// [PROVIDER] - Ambil order berdasarkan ID
exports.getById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, { include: 'items' });
        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }
        res.status(200).json({ message: 'Berhasil mengambil order', data: order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// [PROVIDER] - Ambil order berdasarkan user_id (untuk dikonsumsi UserService)
exports.getByUserId = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.params.userId },
            include: 'items',
            order: [['created_at', 'DESC']],
        });
        res.status(200).json({ message: 'Berhasil mengambil order user', data: orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update status order
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'paid', 'shipped', 'done', 'cancelled'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status tidak valid. Gunakan salah satu: ${validStatuses.join(', ')}`,
            });
        }

        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            message: 'Status order berhasil diupdate',
            data: { id: order.id, order_number: order.order_number, status: order.status },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
