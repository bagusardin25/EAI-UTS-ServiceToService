<?php declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * End-to-end coverage of the Lighthouse GraphQL endpoint (POST /graphql),
 * mirroring the contract previously served by rebing/graphql-laravel.
 */
class GraphQLTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $admin = User::create([
            'name' => 'Admin', 'email' => 'admin@example.com',
            'password' => 'password', 'role' => 'admin', 'is_active' => true,
        ]);
        UserAddress::create([
            'user_id' => $admin->id, 'label' => 'Kantor', 'street' => 'Jl. Sudirman No. 1',
            'city' => 'Jakarta', 'province' => 'DKI Jakarta', 'postal_code' => '10210',
            'is_primary' => true,
        ]);

        return $admin;
    }

    private function gql(string $query, array $variables = [], ?User $as = null): \Illuminate\Testing\TestResponse
    {
        if ($as) {
            $this->actingAs($as, 'sanctum');
        }

        return $this->postJson('/graphql', ['query' => $query, 'variables' => $variables]);
    }

    public function test_register_creates_user_and_returns_token(): void
    {
        $res = $this->gql('mutation($n:String!,$e:String!,$p:String!){ register(name:$n,email:$e,password:$p){ access_token token_type user{ id email role } } }', [
            'n' => 'Fajar', 'e' => 'fajar@example.com', 'p' => 'password123',
        ]);

        $res->assertOk();
        $this->assertNotEmpty($res->json('data.register.access_token'));
        $this->assertSame('Bearer', $res->json('data.register.token_type'));
        $this->assertSame('fajar@example.com', $res->json('data.register.user.email'));
        // Public registration must always be role "user", never admin.
        $this->assertSame('user', $res->json('data.register.user.role'));
        $this->assertDatabaseHas('users', ['email' => 'fajar@example.com', 'role' => 'user']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::create(['name' => 'Gita', 'email' => 'gita@example.com', 'password' => 'password', 'role' => 'user', 'is_active' => true]);

        $res = $this->gql('mutation{ register(name:"Gita2", email:"gita@example.com", password:"password123"){ access_token } }')->assertOk();
        $this->assertNull($res->json('data.register'));
        $this->assertNotEmpty($res->json('errors'));
    }

    public function test_login_returns_token_and_user(): void
    {
        User::create([
            'name' => 'Budi', 'email' => 'budi@example.com',
            'password' => 'password', 'role' => 'user', 'is_active' => true,
        ]);

        $res = $this->gql('mutation($e:String!,$p:String!){ login(email:$e,password:$p){ access_token token_type user{ id role } } }', [
            'e' => 'budi@example.com', 'p' => 'password',
        ]);

        $res->assertOk();
        $this->assertNotEmpty($res->json('data.login.access_token'));
        $this->assertSame('Bearer', $res->json('data.login.token_type'));
        $this->assertSame('user', $res->json('data.login.user.role'));
    }

    public function test_me_requires_auth_and_returns_current_user(): void
    {
        $this->gql('{ me { id } }')->assertOk()->assertJsonPath('data.me', null);

        $admin = $this->admin();
        $this->gql('{ me { id email role addresses { city is_primary } } }', [], $admin)
            ->assertOk()
            ->assertJsonPath('data.me.email', 'admin@example.com')
            ->assertJsonPath('data.me.addresses.0.city', 'Jakarta');
    }

    public function test_admin_only_fields_reject_non_admin(): void
    {
        $user = User::create([
            'name' => 'Citra', 'email' => 'citra@example.com',
            'password' => 'password', 'role' => 'user', 'is_active' => true,
        ]);

        $res = $this->gql('{ users { id } }', [], $user)->assertOk();
        $this->assertNull($res->json('data.users'));
        $this->assertNotEmpty($res->json('errors'));
    }

    public function test_admin_users_query_with_search_and_limit(): void
    {
        $admin = $this->admin();
        User::create(['name' => 'Dewi', 'email' => 'dewi@example.com', 'password' => 'password', 'role' => 'user', 'is_active' => true]);

        $res = $this->gql('{ users(search:"dewi", limit:5){ name email } }', [], $admin)->assertOk();
        $this->assertSame('Dewi', $res->json('data.users.0.name'));
        $this->assertCount(1, $res->json('data.users'));
    }

    public function test_create_update_delete_user_flow(): void
    {
        $admin = $this->admin();

        $created = $this->gql('mutation{ createUser(name:"Eka", email:"eka@example.com", password:"password123", role:"user"){ id email role } }', [], $admin)
            ->assertOk();
        $id = $created->json('data.createUser.id');
        $this->assertSame('eka@example.com', $created->json('data.createUser.email'));

        $this->gql('mutation($id:Int!){ updateUser(id:$id, name:"Eka Updated", phone:"0899"){ id name phone } }', ['id' => $id], $admin)
            ->assertOk()
            ->assertJsonPath('data.updateUser.name', 'Eka Updated');

        $this->gql('mutation($id:Int!){ deleteUser(id:$id) }', ['id' => $id], $admin)
            ->assertOk()
            ->assertJsonPath('data.deleteUser', true);

        $this->assertDatabaseMissing('users', ['email' => 'eka@example.com']);
    }

    public function test_update_user_email_unique_ignores_self(): void
    {
        $admin = $this->admin();

        // Updating admin with its own email must pass (ignore self).
        $this->gql('mutation($id:Int!){ updateUser(id:$id, email:"admin@example.com", name:"Admin2"){ id name } }', ['id' => $admin->id], $admin)
            ->assertOk()
            ->assertJsonPath('data.updateUser.name', 'Admin2');
    }
}
