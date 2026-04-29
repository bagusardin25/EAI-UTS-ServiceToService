<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Elektronik',
            'Pakaian Pria',
            'Pakaian Wanita',
            'Peralatan Rumah Tangga',
            'Kesehatan & Kecantikan',
            'Hobi & Koleksi',
            'Otomotif',
            'Makanan & Minuman',
            'Olahraga',
            'Komputer & Aksesoris'
        ];

        $name = $this->faker->unique()->randomElement($categories);
        
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => "Berbagai macam produk kategori " . $name . " berkualitas tinggi.",
        ];
    }
}
