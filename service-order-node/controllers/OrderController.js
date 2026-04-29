const db = require('../config/database');
const { Order, OrderItem } = require('../models');

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
        const {
            items,
            shipping_address,
            notes,
            total,
            total_amount: totalAmountFromClient,
        } = req.body;

        // Ambil data user dari token yang sudah disahkan middleware
        const user_id = req.user.id;
        const user_name = req.user.name;
        const user_email = req.user.email;

        // Validasi input dasar
        if (!items || !items.length) {
            await t.rollback();
            return res.status(400).json({ message: 'items pesanan wajib diisi' });
        }

        let total_amount = 0;
        const orderItems = [];

        for (const item of items) {
            const quantity = Number(item.quantity || 1);
            const unitPrice = Number(item.price ?? item.unit_price ?? 0);
            const productName = item.name || item.product_name || `Product ${item.product_id}`;
            const productSku = item.sku || item.product_sku || null;
            const subtotal = unitPrice * quantity;
            total_amount += subtotal;

            orderItems.push({
                product_id: item.product_id,
                product_name: productName,
                product_sku: productSku,
                unit_price: unitPrice,
                quantity,
                subtotal,
            });
        }

        // Simpan order header
        const finalTotalAmount = totalAmountFromClient || total || total_amount;

        const order = await Order.create({
            order_number: generateOrderNumber(),
            user_id,
            user_name: user_name || null,
            user_email: user_email || null,
            shipping_address: typeof shipping_address === 'object' ? JSON.stringify(shipping_address) : shipping_address,
            status: 'pending',
            total_amount: finalTotalAmount,
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// [BUYER] - Ambil semua order milik user yang sedang login
exports.getAll = async (req, res) => {
    try {
        const orders = await Order.findAll({ 
            where: { user_id: req.user.id },
            include: 'items', 
            order: [['created_at', 'DESC']] 
        });
        res.status(200).json({ message: 'Berhasil mengambil semua order', data: orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// [ADMIN] - Ambil SEMUA order dari semua user (tanpa filter user_id)
exports.getAllAdmin = async (req, res) => {
    try {
        const orders = await Order.findAll({ 
            include: 'items', 
            order: [['created_at', 'DESC']] 
        });
        res.status(200).json({ message: 'Berhasil mengambil semua order (admin)', data: orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// [BUYER] - Ambil order berdasarkan ID (hanya milik sendiri)
exports.getById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, { include: 'items' });
        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }
        // Pastikan order ini milik user yang sedang login
        // Gunakan Number() karena database Sequelize pg mengembalikan BIGINT sebagai string
        if (Number(order.user_id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke order ini' });
        }
        res.status(200).json({ message: 'Berhasil mengambil order', data: order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// [ADMIN/PROVIDER] - Ambil order berdasarkan user_id (untuk dikonsumsi UserService)
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

// [ADMIN] - Update status order
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

// [BUYER] - Cancel order sendiri (hanya jika masih pending)
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }

        // Pastikan order milik user yang sedang login
        if (Number(order.user_id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke order ini' });
        }

        // Hanya bisa cancel jika masih pending
        if (order.status !== 'pending') {
            return res.status(400).json({ 
                message: `Order tidak dapat dibatalkan karena statusnya sudah '${order.status}'. Hanya order dengan status 'pending' yang bisa dibatalkan.` 
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.status(200).json({
            message: 'Order berhasil dibatalkan',
            data: { id: order.id, order_number: order.order_number, status: order.status },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
