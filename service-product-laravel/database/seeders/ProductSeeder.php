<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'category' => 'Elektronik',
                'description' => 'Gawai dan perangkat elektronik terbaru.',
                'products' => [
                    ['name' => 'Smartphone Samsung Galaxy S24', 'price' => 15000000, 'stock' => 50],
                    ['name' => 'Laptop ASUS ROG Zephyrus', 'price' => 25000000, 'stock' => 20],
                    ['name' => 'Sony Noise Cancelling Headphones', 'price' => 4500000, 'stock' => 30],
                ]
            ],
            [
                'category' => 'Pakaian Pria',
                'description' => 'Koleksi fashion pria modern.',
                'products' => [
                    ['name' => 'Kemeja Flanel Kotak-kotak', 'price' => 250000, 'stock' => 100],
                    ['name' => 'Celana Chino Slim Fit', 'price' => 350000, 'stock' => 80],
                    ['name' => 'Jaket Bomber Navy', 'price' => 500000, 'stock' => 45],
                ]
            ],
            [
                'category' => 'Makanan & Minuman',
                'description' => 'Produk kuliner dan minuman segar.',
                'products' => [
                    ['name' => 'Kopi Arabika Gayo 250g', 'price' => 85000, 'stock' => 200],
                    ['name' => 'Cokelat Batangan Premium', 'price' => 45000, 'stock' => 150],
                    ['name' => 'Teh Hijau Jepang Matcha', 'price' => 120000, 'stock' => 60],
                ]
            ],
        ];

        foreach ($data as $item) {
            $category = Category::create([
                'name' => $item['category'],
                'slug' => Str::slug($item['category']),
                'description' => $item['description'],
            ]);

            foreach ($item['products'] as $prod) {
                Product::create([
                    'category_id' => $category->id,
                    'name' => $prod['name'],
                    'slug' => Str::slug($prod['name']),
                    'description' => "Nikmati kualitas terbaik dari " . $prod['name'] . ". Cocok untuk penggunaan sehari-hari dan menjamin kepuasan Anda.",
                    'price' => $prod['price'],
                    'stock' => $prod['stock'],
                    'sku' => strtoupper(Str::random(3)) . '-' . rand(1000, 9999),
                    'image_url' => 'https://picsum.photos/400/400?random=' . rand(1, 1000),
                    'is_active' => true,
                ]);
            }
        }

        // Opsional: Tambahkan beberapa data acak menggunakan factory jika masih butuh lebih banyak data
        // Category::factory()->count(2)->has(Product::factory()->count(5))->create();
    }
}
