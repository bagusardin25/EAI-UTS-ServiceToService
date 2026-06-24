<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\GraphQL\Concerns\AuthorizesViaSanctum;
use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Query;

class UserQuery extends Query
{
    use AuthorizesViaSanctum;

    protected $attributes = [
        'name' => 'user',
        'description' => 'Fetch a single user by id (admin only)',
    ];

    public function type(): Type
    {
        return GraphQL::type('User');
    }

    public function authorize($root, array $args, $ctx, ?ResolveInfo $resolveInfo = null): bool
    {
        return $this->authorizeAdmin();
    }

    public function args(): array
    {
        return [
            'id' => [
                'type' => Type::nonNull(Type::int()),
                'description' => 'The id of the user',
            ],
        ];
    }

    public function resolve($root, array $args, $context, ResolveInfo $resolveInfo)
    {
        $query = User::query();

        if (array_key_exists('addresses', $resolveInfo->getFieldSelection())) {
            $query->with('userAddresses');
        }

        return $query->find($args['id']);
    }
}
