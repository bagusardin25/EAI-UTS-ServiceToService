<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\GraphQL\Concerns\AuthorizesViaSanctum;
use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Query;

class UsersQuery extends Query
{
    use AuthorizesViaSanctum;

    protected $attributes = [
        'name' => 'users',
        'description' => 'List users with optional filtering (admin only)',
    ];

    public function type(): Type
    {
        return Type::listOf(GraphQL::type('User'));
    }

    public function authorize($root, array $args, $ctx, ?ResolveInfo $resolveInfo = null): bool
    {
        return $this->authorizeAdmin();
    }

    public function args(): array
    {
        return [
            'search' => [
                'type' => Type::string(),
                'description' => 'Filter by name or email (partial match)',
            ],
            'role' => [
                'type' => Type::string(),
                'description' => 'Filter by role (admin / user)',
            ],
            'limit' => [
                'type' => Type::int(),
                'description' => 'Maximum number of rows to return (default 25, max 100)',
            ],
        ];
    }

    public function resolve($root, array $args, $context, ResolveInfo $resolveInfo)
    {
        $fields = $resolveInfo->getFieldSelection();

        $query = User::query();

        // Eager-load addresses only when requested to avoid N+1 queries.
        if (array_key_exists('addresses', $fields)) {
            $query->with('userAddresses');
        }

        if (!empty($args['search'])) {
            $search = $args['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($args['role'])) {
            $query->where('role', $args['role']);
        }

        $limit = min(max((int) ($args['limit'] ?? 25), 1), 100);

        return $query->latest()->limit($limit)->get();
    }
}
