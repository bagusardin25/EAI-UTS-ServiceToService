const axios = require('axios');
const { Payment, PaymentMethod } = require('../models');

/**
 * Generate nomor pembayaran unik
 * Format: PAY-YYYYMMDD-XXXXX
 */
function generatePaymentNumber() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    return `PAY-${date}-${random}`;
}

const resolvers = {
    Query: {
        // Ambil semua pembayaran
        payments: async () => {
            return await Payment.findAll({
                include: [{ model: PaymentMethod, as: 'payment_method' }],
                order: [['created_at', 'DESC']],
            });
        },

        // Ambil pembayaran berdasarkan ID
        payment: async (_, { id }) => {
            return await Payment.findByPk(id, {
                include: [{ model: PaymentMethod, as: 'payment_method' }],
            });
        },

        // Ambil pembayaran berdasarkan Order ID
        paymentsByOrder: async (_, { orderId }) => {
            return await Payment.findAll({
                where: { order_id: orderId },
                include: [{ model: PaymentMethod, as: 'payment_method' }],
                order: [['created_at', 'DESC']],
            });
        },

        // Ambil pembayaran berdasarkan User ID
        paymentsByUser: async (_, { userId }) => {
            return await Payment.findAll({
                where: { user_id: userId },
                include: [{ model: PaymentMethod, as: 'payment_method' }],
                order: [['created_at', 'DESC']],
            });
        },

        // Ambil pembayaran berdasarkan status
        paymentsByStatus: async (_, { status }) => {
            return await Payment.findAll({
                where: { status },
                include: [{ model: PaymentMethod, as: 'payment_method' }],
                order: [['created_at', 'DESC']],
            });
        },

        // Ambil semua metode pembayaran
        paymentMethods: async () => {
            return await PaymentMethod.findAll({
                order: [['id', 'ASC']],
            });
        },

        // Ambil metode pembayaran berdasarkan ID
        paymentMethod: async (_, { id }) => {
            return await PaymentMethod.findByPk(id, {
                include: [{ model: Payment, as: 'payments' }],
            });
        },
    },

    Mutation: {
        // Buat pembayaran baru
        createPayment: async (_, { order_id, user_id, payment_method_id, amount, notes }) => {
            const payment = await Payment.create({
                payment_number: generatePaymentNumber(),
                order_id,
                user_id,
                payment_method_id,
                amount,
                status: 'pending',
                notes,
            });

            return await Payment.findByPk(payment.id, {
                include: [{ model: PaymentMethod, as: 'payment_method' }],
            });
        },

        // Update status pembayaran
        updatePaymentStatus: async (_, { id, status }, context) => {
            const payment = await Payment.findByPk(id);
            if (!payment) {
                throw new Error(`Payment dengan ID ${id} tidak ditemukan`);
            }

            const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
            if (!validStatuses.includes(status)) {
                throw new Error(`Status '${status}' tidak valid. Gunakan: ${validStatuses.join(', ')}`);
            }

            payment.status = status;

            // Set paid_at jika status berubah ke 'paid'
            if (status === 'paid') {
                payment.paid_at = new Date();
                
                // Terintegrasi dengan Order Service: Update status order menjadi 'paid'
                try {
                    const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:8002/api';
                    const authHeader = context?.headers?.authorization || context?.headers?.Authorization;
                    
                    if (authHeader) {
                        console.log(`Mengirim update status 'paid' untuk Order ID ${payment.order_id} ke Order Service...`);
                        await axios.put(`${orderServiceUrl}/orders/${payment.order_id}/status`, {
                            status: 'paid'
                        }, {
                            headers: { Authorization: authHeader }
                        });
                        console.log(`Berhasil update status order ${payment.order_id} menjadi 'paid'`);
                    } else {
                        console.warn(`Peringatan: Tidak ada header Authorization. Gagal update status Order ID ${payment.order_id} di Order Service.`);
                    }
                } catch (error) {
                    console.error(`Gagal integrasi dengan Order Service untuk Order ID ${payment.order_id}:`, error.message);
                    // Kita tidak me-throw error agar payment tetap tersimpan meskipun integrasi order gagal
                }
            }

            await payment.save();

            return await Payment.findByPk(id, {
                include: [{ model: PaymentMethod, as: 'payment_method' }],
            });
        },

        // Buat metode pembayaran baru
        createPaymentMethod: async (_, { name, code }) => {
            return await PaymentMethod.create({ name, code });
        },

        // Update metode pembayaran
        updatePaymentMethod: async (_, { id, name, code, is_active }) => {
            const method = await PaymentMethod.findByPk(id);
            if (!method) {
                throw new Error(`PaymentMethod dengan ID ${id} tidak ditemukan`);
            }

            if (name !== undefined) method.name = name;
            if (code !== undefined) method.code = code;
            if (is_active !== undefined) method.is_active = is_active;

            await method.save();
            return method;
        },

        // Hapus metode pembayaran
        deletePaymentMethod: async (_, { id }) => {
            const method = await PaymentMethod.findByPk(id);
            if (!method) {
                throw new Error(`PaymentMethod dengan ID ${id} tidak ditemukan`);
            }

            await method.destroy();
            return true;
        },
    },

    // Field resolver untuk Payment
    Payment: {
        payment_method: async (parent) => {
            if (parent.payment_method) return parent.payment_method;
            if (!parent.payment_method_id) return null;
            return await PaymentMethod.findByPk(parent.payment_method_id);
        },
    },

    // Field resolver untuk PaymentMethod
    PaymentMethod: {
        payments: async (parent) => {
            if (parent.payments) return parent.payments;
            return await Payment.findAll({
                where: { payment_method_id: parent.id },
            });
        },
    },
};

module.exports = resolvers;
