const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Order = db.define('orders', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_number: { type: DataTypes.STRING(50), unique: true },
    user_id: { type: DataTypes.BIGINT },
    user_name: { type: DataTypes.STRING(100) },
    user_email: { type: DataTypes.STRING(150) },
    shipping_address: { type: DataTypes.TEXT },
    status: {
        type: DataTypes.STRING(20), defaultValue: 'pending',
        validate: { isIn: [['pending', 'paid', 'shipped', 'done', 'cancelled']] }
    },
    total_amount: { type: DataTypes.DECIMAL(14, 2) },
    notes: { type: DataTypes.TEXT },
}, { timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Order;