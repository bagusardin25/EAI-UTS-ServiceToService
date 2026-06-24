<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\User;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Type as GraphQLType;

class UserType extends GraphQLType
{
    protected $attributes = [
        'name' => 'User',
        'description' => 'A registered user / identity in the User Service',
        'model' => User::class,
    ];

    public function fields(): array
    {
        return [
            'id' => [
                'type' => Type::nonNull(Type::int()),
                'description' => 'Primary key of the user',
            ],
            'name' => [
                'type' => Type::nonNull(Type::string()),
                'description' => 'Full name of the user',
            ],
            'email' => [
                'type' => Type::nonNull(Type::string()),
                'description' => 'Unique email address',
            ],
            'role' => [
                'type' => Type::string(),
                'description' => 'Role of the user (admin or user)',
            ],
            'phone' => [
                'type' => Type::string(),
                'description' => 'Phone number',
            ],
            'address' => [
                'type' => Type::string(),
                'description' => 'Free-text address',
            ],
            'is_active' => [
                'type' => Type::boolean(),
                'description' => 'Whether the account is active',
            ],
            'addresses' => [
                'type' => Type::listOf(GraphQL::type('UserAddress')),
                'description' => 'Structured shipping/billing addresses',
                'resolve' => fn (User $user) => $user->userAddresses,
            ],
            'created_at' => [
                'type' => Type::string(),
                'description' => 'Creation timestamp (ISO 8601)',
                'resolve' => fn (User $user) => $user->created_at?->toIso8601String(),
            ],
        ];
    }
}
