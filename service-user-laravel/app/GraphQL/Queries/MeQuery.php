<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\GraphQL\Concerns\AuthorizesViaSanctum;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Query;

class MeQuery extends Query
{
    use AuthorizesViaSanctum;

    protected $attributes = [
        'name' => 'me',
        'description' => 'Returns the currently authenticated user (from the Bearer token)',
    ];

    public function type(): Type
    {
        return GraphQL::type('User');
    }

    public function authorize($root, array $args, $ctx, ?ResolveInfo $resolveInfo = null): bool
    {
        return $this->authorizeAuthenticated();
    }

    public function resolve($root, array $args, $context, ResolveInfo $resolveInfo)
    {
        $user = $this->currentUser();

        // Eager-load addresses only when the client actually requested them.
        if ($user && array_key_exists('addresses', $resolveInfo->getFieldSelection())) {
            $user->load('userAddresses');
        }

        return $user;
    }
}
