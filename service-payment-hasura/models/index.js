const Payment = require('./Payment');
const PaymentMethod = require('./PaymentMethod');

// Associations
PaymentMethod.hasMany(Payment, { foreignKey: 'payment_method_id', as: 'payments' });
Payment.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id', as: 'payment_method' });

module.exports = { Payment, PaymentMethod };
