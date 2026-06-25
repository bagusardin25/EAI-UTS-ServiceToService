<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Resolver for `createUser` mutation (admin only).
 *
 * Argument validation (required / email / unique / min, etc.) is declared via
 * @rules directives in the schema.
 */
final class CreateUser
{
    /** @param array{name: string, email: string, password: string, role?: ?string, phone?: ?string, address?: ?string, is_active?: ?bool} $args */
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): User
    {
        return User::create([
            'name' => $args['name'],
            'email' => $args['email'],
            'password' => Hash::make($args['password']),
            'role' => $args['role'] ?? 'user',
            'phone' => $args['phone'] ?? null,
            'address' => $args['address'] ?? null,
            'is_active' => $args['is_active'] ?? true,
        ]);
    }
}
