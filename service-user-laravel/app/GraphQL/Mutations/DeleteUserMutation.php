<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\GraphQL\Concerns\AuthorizesViaSanctum;
use App\Models\User;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use Rebing\GraphQL\Support\Mutation;

class DeleteUserMutation extends Mutation
{
    use AuthorizesViaSanctum;

    protected $attributes = [
        'name' => 'deleteUser',
        'description' => 'Delete a user by id (admin only). Returns true on success.',
    ];

    public function type(): Type
    {
        return Type::nonNull(Type::boolean());
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
                'rules' => ['required', 'integer', 'exists:users,id'],
            ],
        ];
    }

    public function resolve($root, array $args, $context, ResolveInfo $resolveInfo): bool
    {
        $user = User::find($args['id']);

        if (!$user) {
            return false;
        }

        return (bool) $user->delete();
    }
}
