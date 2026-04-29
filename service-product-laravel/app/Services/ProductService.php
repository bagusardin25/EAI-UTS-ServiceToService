<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    public function getAllProducts(): LengthAwarePaginator
    {
        return Product::with('category')->latest()->paginate(10);
    }

    public function createProduct(array $data): Product
    {
        return Product::create($data);
    }

    public function updateProduct(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    public function deleteProduct(Product $product): bool
    {
        return $product->delete();
    }

    public function adjustStock(Product $product, int $quantity, string $type): Product
    {
        if ($type === 'reduce') {
            if ($product->stock < $quantity) {
                throw new \Exception('Insufficient stock');
            }
            $product->decrement('stock', $quantity);
        } else {
            $product->increment('stock', $quantity);
        }

        return $product->fresh();
    }
}
