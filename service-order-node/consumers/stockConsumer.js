const rabbitmq = require('../services/rabbitmq');
const { Order } = require('../models');

async function startStockConsumer() {
  // rabbitmq is already connected in index.js before this function is called
  await rabbitmq.consume(
    'order_queue',
    'eai_exchange',
    'stock.updated',
    async (data) => {
      console.log('Stock updated for order:', data.order_id);

      const order = await Order.findByPk(data.order_id);
      if (order && data.status === 'success') {
        order.status = 'processing';
        await order.save();
        console.log(`Order ${order.id} status updated to processing`);
      }
    }
  );
}

module.exports = { startStockConsumer };
