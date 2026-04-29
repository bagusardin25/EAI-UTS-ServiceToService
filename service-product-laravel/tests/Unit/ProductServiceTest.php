<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProductService $productService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->productService = new ProductService();
    }

    public function test_can_adjust_stock_add(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        
        $updatedProduct = $this->productService->adjustStock($product, 5, 'add');

        $this->assertEquals(15, $updatedProduct->stock);
    }

    public function test_can_adjust_stock_reduce(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        
        $updatedProduct = $this->productService->adjustStock($product, 5, 'reduce');

        $this->assertEquals(5, $updatedProduct->stock);
    }

    public function test_cannot_reduce_stock_below_zero(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Insufficient stock');

        $this->productService->adjustStock($product, 15, 'reduce');
    }
}
