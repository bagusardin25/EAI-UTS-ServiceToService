const amqp = require('amqplib');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect({
        protocol: 'amqp',
        hostname: process.env.RABBITMQ_HOST || 'localhost',
        port: process.env.RABBITMQ_PORT || 5672,
        username: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASSWORD || 'guest',
        vhost: process.env.RABBITMQ_VHOST || '/'
      });

      this.channel = await this.connection.createChannel();
      console.log('✅ Connected to RabbitMQ');
    } catch (error) {
      console.error('❌ RabbitMQ connection failed:', error);
      throw error;
    }
  }

  async publish(exchange, routingKey, data) {
    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      
      const message = Buffer.from(JSON.stringify(data));
      this.channel.publish(exchange, routingKey, message, {
        persistent: true,
        contentType: 'application/json'
      });

      console.log(`📤 Published to ${exchange}/${routingKey}:`, data);
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }

  async consume(queue, exchange, routingKey, callback) {
    try {
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, exchange, routingKey);

      console.log(`📥 Waiting for messages on ${queue}...`);

      this.channel.consume(queue, async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log('Received:', data);

          try {
            await callback(data);
            this.channel.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            this.channel.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      console.error('Failed to consume messages:', error);
      throw error;
    }
  }

  async close() {
    await this.channel?.close();
    await this.connection?.close();
  }
}

module.exports = new RabbitMQService();
