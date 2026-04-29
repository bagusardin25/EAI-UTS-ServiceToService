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
                'street' => 'Jl. Sudirman No. 1',
                'city' => 'Jakarta Pusat',
                'province' => 'DKI Jakarta',
                'postal_code' => '10210',
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
                'street' => 'Jl. Asia Afrika No. 65',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'postal_code' => '40111',
                'is_primary' => true,
            ]
        );
    }
}
