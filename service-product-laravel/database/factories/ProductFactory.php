<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->words(3, true);
        return [
            'category_id' => Category::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => "Produk " . $name . " pilihan dengan kualitas terbaik untuk memenuhi kebutuhan Anda. Produk ini dirancang dengan material berkualitas dan tahan lama.",
            'price' => $this->faker->randomFloat(0, 50000, 5000000), // Rentang harga 50rb - 5jt
            'stock' => $this->faker->numberBetween(10, 200),
            'sku' => strtoupper(Str::random(3)) . '-' . $this->faker->numberBetween(1000, 9999),
            'image_url' => 'https://picsum.photos/400/400?random=' . $this->faker->numberBetween(1, 1000),
            'is_active' => true,
        ];
    }
}
