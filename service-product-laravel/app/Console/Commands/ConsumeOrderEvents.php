<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RabbitMQService;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use PhpAmqpLib\Message\AMQPMessage;

class ConsumeOrderEvents extends Command
{
    protected $signature = 'rabbitmq:consume-orders';
    protected $description = 'Consume order events from RabbitMQ';

    public function handle()
    {
        $rabbitmq = new RabbitMQService();

        $callback = function (AMQPMessage $msg) use ($rabbitmq) {
            $data = json_decode($msg->body, true);
            
            Log::info('Received order event', $data);
            $this->info("Processing order: {$data['order_id']}");

            try {
                foreach ($data['items'] as $item) {
                    $product = Product::find($item['product_id']);
                    
                    if ($product) {
                        $product->stock -= $item['quantity'];
                        $product->save();
                        
                        $this->info("Updated stock for product {$product->id}: {$product->stock}");
                    }
                }

                $rabbitmq->publish(
                    'eai_exchange',
                    'stock.updated',
                    [
                        'order_id' => $data['order_id'],
                        'status' => 'success',
                        'timestamp' => now()->toIso8601String()
                    ]
                );

                $msg->ack();
                $this->info("Order {$data['order_id']} processed successfully");
                
            } catch (\Exception $e) {
                Log::error('Failed to process order', [
                    'error' => $e->getMessage(),
                    'order_id' => $data['order_id']
                ]);
                
                $msg->nack(true);
            }
        };

        $rabbitmq->consume('product_queue', 'eai_exchange', 'order.created', $callback);
    }
}
