const { PaymentMethod } = require('../models');

/**
 * Seed payment methods ke database jika belum ada
 */
async function seedPaymentMethods() {
    const count = await PaymentMethod.count();
    if (count === 0) {
        const methods = [
            { name: 'Bank Transfer', code: 'bank_transfer' },
            { name: 'E-Wallet (GoPay)', code: 'gopay' },
            { name: 'E-Wallet (OVO)', code: 'ovo' },
            { name: 'E-Wallet (DANA)', code: 'dana' },
            { name: 'Credit Card', code: 'credit_card' },
            { name: 'Cash on Delivery', code: 'cod' },
        ];

        await PaymentMethod.bulkCreate(methods);
        console.log(`Seeded ${methods.length} payment methods`);
    } else {
        console.log(`Payment methods already seeded (${count} records)`);
    }
}

module.exports = { seedPaymentMethods };
