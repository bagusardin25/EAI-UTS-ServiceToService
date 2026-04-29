<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'phone' => '081200000001',
                'address' => 'Jakarta',
                'is_active' => true,
            ]
        );

        UserAddress::updateOrCreate(
            ['user_id' => $admin->id, 'label' => 'Kantor'],
            [
                'street' => fake()->streetAddress(),
                'city' => fake()->city(),
                'province' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'is_primary' => true,
            ]
        );

        // Create a specific user for testing login
        $testUser = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'role' => 'user',
                'phone' => '081234567890',
                'address' => 'Bandung',
                'is_active' => true,
            ]
        );

        UserAddress::updateOrCreate(
            ['user_id' => $testUser->id, 'label' => 'Rumah'],
            [
                'street' => fake()->streetAddress(),
                'city' => fake()->city(),
                'province' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'is_primary' => true,
            ]
        );

        // Generate 10 users using Factory
        User::factory()->count(10)->create()->each(function ($user) {
            // For each user, create 1 primary address
            UserAddress::updateOrCreate(
                ['user_id' => $user->id, 'label' => 'Rumah'],
                [
                    'street' => fake()->streetAddress(),
                    'city' => fake()->city(),
                    'province' => fake()->state(),
                    'postal_code' => fake()->postcode(),
                    'is_primary' => true,
                ]
            );
        });
    }
}
