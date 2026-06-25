<?php declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\User as UserModel;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Resolver for `user(id)` query (admin only — authorized via @guard + @admin).
 */
final class User
{
    /** @param array{id: int} $args */
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): ?UserModel
    {
        return UserModel::find($args['id']);
    }
}
