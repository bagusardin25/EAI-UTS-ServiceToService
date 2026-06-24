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

class UpdateUserMutation extends Mutation
{
    use AuthorizesViaSanctum;

    protected $attributes = [
        'name' => 'updateUser',
        'description' => 'Update an existing user (admin only)',
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
                'rules' => ['required', 'integer', 'exists:users,id'],
            ],
            'name' => [
                'type' => Type::string(),
                'rules' => ['sometimes', 'string', 'max:100'],
            ],
            'email' => [
                'type' => Type::string(),
                'rules' => ['sometimes', 'email', 'max:150'],
            ],
            'password' => [
                'type' => Type::string(),
                'rules' => ['sometimes', 'string', 'min:8'],
            ],
            'role' => [
                'type' => Type::string(),
                'rules' => ['sometimes', 'in:admin,user'],
            ],
            'phone' => [
                'type' => Type::string(),
                'rules' => ['sometimes', 'nullable', 'string', 'max:20'],
            ],
            'address' => [
                'type' => Type::string(),
                'rules' => ['sometimes', 'nullable', 'string'],
            ],
            'is_active' => [
                'type' => Type::boolean(),
            ],
        ];
    }

    /**
     * Dynamic rules that depend on the incoming arguments.
     *
     * The email uniqueness check must ignore the row being updated, which is
     * only known at request time — hence it lives here rather than in args().
     *
     * @param  array<string, mixed>  $args
     * @return array<string, mixed>
     */
    protected function rules(array $args = []): array
    {
        if (!array_key_exists('email', $args)) {
            return [];
        }

        return [
            'email' => ['unique:users,email,' . ($args['id'] ?? 'NULL')],
        ];
    }

    public function resolve($root, array $args, $context, ResolveInfo $resolveInfo): ?User
    {
        $user = User::find($args['id']);

        if (!$user) {
            return null;
        }

        $data = collect($args)
            ->only(['name', 'email', 'password', 'role', 'phone', 'address', 'is_active'])
            ->toArray();

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return $user->fresh();
    }
}
