<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_products(): void
    {
        Product::factory()->count(5)->create();

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'data',
                    'current_page',
                    'first_page_url'
                ]
            ]);
    }

    public function test_can_create_product(): void
    {
        $category = Category::factory()->create();
        $data = [
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'price' => 1000,
            'stock' => 10,
            'sku' => 'TESTSKU',
            'is_active' => true
        ];

        $response = $this->postJson('/api/products', $data);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Test Product']);
    }

    public function test_can_show_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => $product->name]);
    }

    public function test_can_update_stock_endpoint(): void
    {
        $product = Product::factory()->create(['stock' => 10]);

        $response = $this->patchJson("/api/products/{$product->id}/stock", [
            'quantity' => 5,
            'type' => 'reduce'
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['stock' => 5]);
    }
}
