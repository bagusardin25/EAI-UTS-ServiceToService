<?php declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Resolver for `users` query (admin only — authorized via @guard + @admin).
 *
 * The `addresses` relation is batch-loaded by the @hasMany directive only when
 * requested, so no manual eager-load / N+1 handling is needed here.
 *
 * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\User>
 */
final class Users
{
    /** @param array{search?: ?string, role?: ?string, limit?: ?int} $args */
    public function __invoke(mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo): Collection
    {
        $query = User::query();

        if (! empty($args['search'])) {
            $search = $args['search'];
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($args['role'])) {
            $query->where('role', $args['role']);
        }

        $limit = min(max((int) ($args['limit'] ?? 25), 1), 100);

        return $query->latest()->limit($limit)->get();
    }
}
