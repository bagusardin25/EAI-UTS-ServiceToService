<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserAddress;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create a specific user for testing login
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'), // Or you can let the factory use default 'password'
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        UserAddress::create([
            'user_id' => $testUser->id,
            'label' => 'Rumah',
            'street' => fake()->streetAddress(),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'postal_code' => fake()->postcode(),
            'is_primary' => true,
        ]);

        // Generate 10 users using Factory
        User::factory()->count(10)->create()->each(function ($user) {
            // For each user, create 1 primary address
            UserAddress::create([
                'user_id' => $user->id,
                'label' => 'Rumah',
                'street' => fake()->streetAddress(),
                'city' => fake()->city(),
                'province' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'is_primary' => true,
            ]);
        });
    }
}
