const { DataTypes } = require('sequelize');
const db = require('../config/database');

const OrderItem = db.define('order_items', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.BIGINT, allowNull: false },
    product_id: { type: DataTypes.BIGINT },
    product_name: { type: DataTypes.STRING(150) },
    product_sku: { type: DataTypes.STRING(100) },
    unit_price: { type: DataTypes.DECIMAL(12, 2) },
    quantity: { type: DataTypes.INTEGER },
    subtotal: { type: DataTypes.DECIMAL(14, 2) },
}, { timestamps: false });

module.exports = OrderItem;
