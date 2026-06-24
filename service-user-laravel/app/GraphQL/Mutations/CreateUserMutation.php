<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\GraphQL\Concerns\AuthorizesViaSanctum;
use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Illuminate\Support\Facades\Hash;
use Rebing\GraphQL\Support\Facades\GraphQL;
use Rebing\GraphQL\Support\Mutation;

class CreateUserMutation extends Mutation
{
    use AuthorizesViaSanctum;

    protected $attributes = [
        'name' => 'createUser',
        'description' => 'Create a new user (admin only)',
    ];

    public function type(): Type
    {
        return Type::nonNull(GraphQL::type('User'));
    }

    public function authorize($root, array $args, $ctx, ?ResolveInfo $resolveInfo = null): bool
    {
        return $this->authorizeAdmin();
    }

    public function args(): array
    {
        return [
            'name' => [
                'type' => Type::nonNull(Type::string()),
                'rules' => ['required', 'string', 'max:100'],
            ],
            'email' => [
                'type' => Type::nonNull(Type::string()),
                'rules' => ['required', 'email', 'max:150', 'unique:users,email'],
            ],
            'password' => [
                'type' => Type::nonNull(Type::string()),
                'rules' => ['required', 'string', 'min:8'],
            ],
            'role' => [
                'type' => Type::string(),
                'rules' => ['nullable', 'in:admin,user'],
            ],
            'phone' => [
                'type' => Type::string(),
                'rules' => ['nullable', 'string', 'max:20'],
            ],
            'address' => [
                'type' => Type::string(),
                'rules' => ['nullable', 'string'],
            ],
            'is_active' => [
                'type' => Type::boolean(),
            ],
        ];
    }

    public function resolve($root, array $args, $context, ResolveInfo $resolveInfo): User
    {
        return User::create([
            'name' => $args['name'],
            'email' => $args['email'],
            'password' => Hash::make($args['password']),
            'role' => $args['role'] ?? 'user',
            'phone' => $args['phone'] ?? null,
            'address' => $args['address'] ?? null,
            'is_active' => $args['is_active'] ?? true,
        ]);
    }
}
