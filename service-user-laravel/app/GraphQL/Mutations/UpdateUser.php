<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Resolver for `updateUser` mutation (admin only).
 *
 * Static argument validation comes from @rules in the schema; the email
 * uniqueness check that must ignore the row being updated lives in
 * App\GraphQL\Validators\UpdateUserValidator (@validator directive).
 */
final class UpdateUser
{
    /** @param array<string, mixed> $args */
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): ?User
    {
        $user = User::find($args['id']);

        if (! $user) {
            return null;
        }

        $data = collect($args)
            ->only(['name', 'email', 'password', 'role', 'phone', 'address', 'is_active'])
            ->toArray();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user->fresh();
    }
}
