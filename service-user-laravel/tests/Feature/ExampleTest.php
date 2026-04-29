<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_protected_api_returns_unauthorized_json_without_redirect(): void
    {
        $response = $this->get('/api/auth/profile');

        $response
            ->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_authenticated_user_can_update_own_profile(): void
    {
        $user = User::factory()->create([
            'email' => 'buyer@example.com',
            'role' => 'user',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/auth/profile', [
            'name' => 'Updated Buyer',
            'email' => 'updated-buyer@example.com',
            'phone' => '081234567890',
            'address' => 'Jl. Buyer Baru No. 1',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.email', 'updated-buyer@example.com');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Buyer',
            'email' => 'updated-buyer@example.com',
        ]);
    }

    public function test_buyer_cannot_access_admin_user_list(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'user']));

        $this->getJson('/api/users')
            ->assertForbidden()
            ->assertJson([
                'status' => 'error',
                'message' => 'Unauthorized: Admin Only',
            ]);
    }

    public function test_admin_can_create_user_manually(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $response = $this->postJson('/api/users', [
            'name' => 'Manual Buyer',
            'email' => 'manual-buyer@example.com',
            'password' => 'password123',
            'role' => 'user',
            'is_active' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'manual-buyer@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'manual-buyer@example.com',
            'role' => 'user',
            'is_active' => true,
        ]);
    }
}
