<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class AuthPayloadType extends GraphQLType
{
    protected $attributes = [
        'name' => 'AuthPayload',
        'description' => 'Result of a successful authentication',
    ];

    public function fields(): array
    {
        return [
            'access_token' => [
                'type' => Type::nonNull(Type::string()),
                'description' => 'Sanctum bearer token to use on subsequent requests',
            ],
            'token_type' => [
                'type' => Type::nonNull(Type::string()),
                'description' => 'Always "Bearer"',
            ],
            'user' => [
                'type' => Type::nonNull(GraphQL::type('User')),
                'description' => 'The authenticated user',
            ],
        ];
    }
}
