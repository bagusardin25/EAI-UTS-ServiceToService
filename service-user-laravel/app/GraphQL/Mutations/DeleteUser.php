<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\User;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Resolver for `deleteUser` mutation (admin only). Returns true on success.
 */
final class DeleteUser
{
    /** @param array{id: int} $args */
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        $user = User::find($args['id']);

        if (! $user) {
            return false;
        }

        return (bool) $user->delete();
    }
}
