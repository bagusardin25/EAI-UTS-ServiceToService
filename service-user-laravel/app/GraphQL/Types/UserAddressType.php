<?php

declare(strict_types=1);

namespace App\GraphQL\Types;

use App\Models\UserAddress;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Type as GraphQLType;

class UserAddressType extends GraphQLType
{
    protected $attributes = [
        'name' => 'UserAddress',
        'description' => 'A structured address belonging to a user',
        'model' => UserAddress::class,
    ];

    public function fields(): array
    {
        return [
            'id' => [
                'type' => Type::nonNull(Type::int()),
                'description' => 'Primary key of the address',
            ],
            'label' => [
                'type' => Type::string(),
                'description' => 'Label such as "Home" or "Office"',
            ],
            'street' => [
                'type' => Type::string(),
                'description' => 'Street line',
            ],
            'city' => [
                'type' => Type::string(),
                'description' => 'City',
            ],
            'province' => [
                'type' => Type::string(),
                'description' => 'Province / state',
            ],
            'postal_code' => [
                'type' => Type::string(),
                'description' => 'Postal / ZIP code',
            ],
            'is_primary' => [
                'type' => Type::boolean(),
                'description' => 'Whether this is the primary address',
            ],
        ];
    }
}
