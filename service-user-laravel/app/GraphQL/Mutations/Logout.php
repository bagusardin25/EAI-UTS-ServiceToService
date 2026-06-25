<?php declare(strict_types=1);

namespace App\GraphQL\Mutations;

use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Resolver for `logout` mutation (auth required).
 *
 * Revokes ALL of the authenticated user's Sanctum tokens, logging them out of
 * every device. Authorization is enforced by the @guard directive in the schema.
 */
final class Logout
{
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): bool
    {
        $user = $context->user();

        if ($user === null) {
            return false;
        }

        $user->tokens()->delete();

        return true;
    }
}
