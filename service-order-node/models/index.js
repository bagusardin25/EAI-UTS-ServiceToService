const Order = require('./Order');
const OrderItem = require('./OrderItem');

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = { Order, OrderItem };
