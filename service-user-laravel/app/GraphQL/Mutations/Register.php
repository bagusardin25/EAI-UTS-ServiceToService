<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Resolver for `register` mutation (public).
 *
 * Creates a new account with role forced to "user" (public registration must
 * never grant admin), then issues a Sanctum token so the caller is logged in
 * immediately — same AuthPayload shape as `login`.
 *
 * Argument validation (required / email / unique / min:8) is declared via
 * @rules directives in the schema.
 */
final class Register
{
    /**
     * @param array{name: string, email: string, password: string, phone?: ?string, address?: ?string} $args
     *
     * @return array{access_token: string, token_type: string, user: \App\Models\User}
     */
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): array
    {
        $user = User::create([
            'name' => $args['name'],
            'email' => $args['email'],
            'password' => Hash::make($args['password']),
            'role' => 'user',
            'phone' => $args['phone'] ?? null,
            'address' => $args['address'] ?? null,
            'is_active' => true,
        ]);

        $token = $user->createToken('graphql_token')->plainTextToken;

        return [
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ];
    }
}
